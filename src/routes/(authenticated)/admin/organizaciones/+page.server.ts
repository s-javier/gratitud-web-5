import { redirect, type RequestEvent } from '@sveltejs/kit'
import { and, eq, ne } from 'drizzle-orm'
import { Page } from '~/enums'
import db from '~/lib/server/db'
import { organizationPersonRoleTable, organizationTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export async function load(event: RequestEvent) {
  try {
    const organizations = await db
      .select({
        id: organizationTable.id,
        title: organizationTable.title,
        isActive: organizationTable.isActive,
      })
      .from(organizationTable)
    return {
      organizations,
    }
  } catch (e: any) {
    rollbar.error('Error en DB. Obtener todas las organizaciones.', e)
    return {
      error: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.',
    }
  }
}

class Machine {
  personId: string
  oldOrganizationId: string
  newOrganizationId: string
  error: {
    server?: string
  } = {}

  constructor(personId: string, oldOrganizationId: string, newOrganizationId: string) {
    this.personId = personId
    this.oldOrganizationId = oldOrganizationId
    this.newOrganizationId = newOrganizationId
  }

  getIsError() {
    return Object.keys(this.error).length > 0
  }

  validateOrganizationId() {
    if (this.oldOrganizationId === this.newOrganizationId) {
      throw new Error()
    }
  }

  async getOrganizationToChange() {
    let query: any[] = []
    try {
      query = await db
        .select({ isSelected: organizationPersonRoleTable.isSelected })
        .from(organizationPersonRoleTable)
        .where(
          and(
            eq(organizationPersonRoleTable.organizationId, this.newOrganizationId),
            eq(organizationPersonRoleTable.personId, this.personId),
          ),
        )
    } catch (e: any) {
      rollbar.error('Error en DB. Obtener la organización a cambiar.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      rollbar.error('El usuario no pertenece a la organización que desea cambiarse.')
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async enableNewOrganization() {
    try {
      await db
        .update(organizationPersonRoleTable)
        .set({ isSelected: true })
        .where(
          and(
            eq(organizationPersonRoleTable.organizationId, this.newOrganizationId),
            eq(organizationPersonRoleTable.personId, this.personId),
          ),
        )
    } catch (e: any) {
      rollbar.error('Error en DB. Habilitar la nueva organización.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async disableOldOrganization() {
    try {
      await db
        .update(organizationPersonRoleTable)
        .set({ isSelected: false })
        .where(
          and(
            ne(organizationPersonRoleTable.organizationId, this.newOrganizationId),
            eq(organizationPersonRoleTable.personId, this.personId),
          ),
        )
    } catch (e: any) {
      rollbar.error('Error en DB. Deshabilitar todas las organizaciones menos la nueva.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }
}

export const actions = {
  change: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxOrganizationId = data.get('organizationId')
    const organizationId: string = typeof auxOrganizationId === 'string' ? auxOrganizationId : ''

    const machine = new Machine(event.locals.userId, event.locals.organizationId, organizationId)

    try {
      machine.validateOrganizationId()
      await machine.getOrganizationToChange()
      await machine.enableNewOrganization()
      await machine.disableOldOrganization()
    } catch {}

    if (machine.getIsError()) {
      return { error: machine.error }
    }

    redirect(303, Page.ADMIN_WELCOME)
  },
  edit: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxOrganizationId = data.get('organizationId')
    const organizationId: string = typeof auxOrganizationId === 'string' ? auxOrganizationId : ''
    const auxTitle = data.get('title')
    const title: string = typeof auxTitle === 'string' ? auxTitle : ''
    const auxIsActive = data.get('status')
    const isActive: boolean = auxIsActive === 'true'
    console.log({
      organizationId,
      title,
      isActive,
    })
  },
}

import { redirect, type RequestEvent } from '@sveltejs/kit'
import { and, eq, ne } from 'drizzle-orm'
import { Page } from '~/enums'
import Auth from '~/lib/server/Auth'
import db from '~/lib/server/db'
import { organizationPersonRoleTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

// export async function load() {}

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
    const sessionId = event.cookies.get('token')
    const auth = new Auth(sessionId ?? '')
    // await auth.validateAuth(event.url.pathname)
    await auth.validateAuth(Page.ADMIN_WELCOME)
    if (auth.getIsErrorToRedirectLogin()) {
      event.cookies.delete('token', { path: '/' })
      redirect(303, Page.LOGIN)
    }
    if (auth.getIsError()) {
      return { error: auth.error }
    }
    if (auth.getIsErrorToRedirectWelcome()) {
      redirect(303, Page.ADMIN_WELCOME)
    }

    const data = await event.request.formData()
    const auxOrganizationId = data.get('organizationId')
    const organizationId: string = typeof auxOrganizationId === 'string' ? auxOrganizationId : ''

    const machine = new Machine(
      auth.session.personId,
      auth.userOrgRole.organizationId,
      organizationId,
    )

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
}

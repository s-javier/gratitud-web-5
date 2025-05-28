import { and, eq, ne } from 'drizzle-orm'
import db from '~/lib/server/db'
import { organizationPersonRoleTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class MachineToChange {
  personId: string
  oldOrganizationId: string
  newOrganizationId: string
  oldRoleId: string
  newRoleId: string
  error: {
    server?: string
  } = {}

  constructor(input: {
    userId: string
    oldOrganizationId: string
    newOrganizationId: string
    oldRoleId: string
    newRoleId: string
  }) {
    this.personId = input.userId
    this.oldOrganizationId = input.oldOrganizationId
    this.newOrganizationId = input.newOrganizationId
    this.oldRoleId = input.oldRoleId
    this.newRoleId = input.newRoleId
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validateOrganizationId() {
    if (this.oldOrganizationId === this.newOrganizationId && this.oldRoleId === this.newRoleId) {
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
            eq(organizationPersonRoleTable.roleId, this.newRoleId),
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
            eq(organizationPersonRoleTable.organizationId, this.oldOrganizationId),
            eq(organizationPersonRoleTable.roleId, this.oldRoleId),
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

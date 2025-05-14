import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import db from '~/lib/server/db'
import { organizationTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class MachineToEdit {
  organizationId: string
  title: string
  status: boolean
  error: {
    organizationId?: string
    title?: string
    server?: string
  } = {}
  organizations: any[] = []

  constructor(input: { title: string; status: boolean })
  constructor()
  constructor(input: { organizationId: string; title: string; status: boolean })
  constructor(input: { organizationId: string })

  constructor(input: { organizationId?: string; title?: string; status?: boolean } = {}) {
    this.organizationId = input.organizationId ?? ''
    this.title = input.title ?? ''
    this.status = input.status ?? false
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validateOrganizationId() {
    const organizationIdErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.uuid('El valor de este campo es inválido.'),
      ),
      this.organizationId,
    )
    if (organizationIdErr.issues) {
      this.error.organizationId = organizationIdErr.issues[0].message
    }
  }

  validateTitle() {
    const titleErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(2, 'Por favor, escribe un poco más.'),
      ),
      this.title,
    )
    if (titleErr.issues) {
      this.error.title = titleErr.issues[0].message
    }
  }

  validateForm() {
    if (Object.keys(this.error).length > 0) {
      throw new Error()
    }
  }

  validateFormToCreate() {
    this.validateTitle()
    this.validateForm()
  }

  validateFormToUpdate() {
    this.validateOrganizationId()
    this.validateTitle()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validateOrganizationId()
    this.validateForm()
  }

  async create() {
    try {
      await db.insert(organizationTable).values({ title: this.title, isActive: this.status })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de organización.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAll() {
    try {
      this.organizations = await db
        .select({
          id: organizationTable.id,
          title: organizationTable.title,
          isActive: organizationTable.isActive,
        })
        .from(organizationTable)
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todas las organizaciones.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async update() {
    try {
      await db
        .update(organizationTable)
        .set({
          title: this.title,
          isActive: this.status,
        })
        .where(eq(organizationTable.id, this.organizationId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización de organización.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async delete() {
    try {
      await db.delete(organizationTable).where(eq(organizationTable.id, this.organizationId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de organización.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

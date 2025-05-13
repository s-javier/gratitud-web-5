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
    title?: string
    server?: string
  } = {}
  organizations: any[] = []

  constructor(organizationId: string, title: string, status: boolean)
  constructor()

  constructor(organizationId?: string, title?: string, status?: boolean) {
    this.organizationId = organizationId ?? ''
    this.title = title ?? ''
    this.status = status ?? false
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validateForm() {
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
      this.error.server = organizationIdErr.issues[0].message
    }

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

    if (Object.keys(this.error).length > 0) {
      throw new Error()
    }
  }

  async create() {}

  async read() {
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

  async delete() {}
}

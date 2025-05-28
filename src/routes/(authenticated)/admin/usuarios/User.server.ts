import * as v from 'valibot'
import { and, eq, is, isNull, or, sql } from 'drizzle-orm'
import db from '~/lib/server/db'
import {
  personTable,
  organizationPersonRoleTable,
  organizationTable,
  roleTable,
} from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class User {
  userId: string
  firstName: string
  lastName: string
  email: string
  status: boolean
  organizationId: string
  roleId: string
  organizationUserRoleId: string
  isConfirmed: boolean
  pathToRedirect: string
  error: {
    userId?: string
    firstName?: string
    lastName?: string
    email?: string
    status?: string
    organizationId?: string
    roleId?: string
    organizationUserRoleId?: string
    isConfirmed?: string
    pathToRedirect?: string
    server?: string
  } = {}
  users: any[] = []
  userAndOrganizationsAndRoles?: {
    id: string
    firstName: string
    lastName: string | null
    email: string
    isActive: boolean
    organizationsAndRoles: any[]
    missingOrganizationsAndRoles: any[]
  }

  constructor()
  constructor(input: { firstName: string; lastName: string; email: string; status: boolean })
  constructor(input: {
    userId: string
    firstName: string
    lastName: string
    email: string
    status: boolean
  })
  constructor(input: { isConfirmed: boolean; userId: string })
  constructor(input: {
    organizationId: string
    userId: string
    roleId: string
    pathToRedirect: string
  })
  constructor(input: {
    organizationUserRoleId: string
    isConfirmed: boolean
    pathToRedirect: string
  })

  constructor(
    input: {
      userId?: string
      firstName?: string
      lastName?: string
      email?: string
      status?: boolean
      organizationId?: string
      roleId?: string
      isConfirmed?: boolean
      pathToRedirect?: string
      organizationUserRoleId?: string
    } = {},
  ) {
    this.userId = input.userId ?? ''
    this.firstName = input.firstName ?? ''
    this.lastName = input.lastName ?? ''
    this.email = input.email ?? ''
    this.status = input.status ?? false
    this.isConfirmed = input.isConfirmed ?? false
    this.organizationId = input.organizationId ?? ''
    this.roleId = input.roleId ?? ''
    this.organizationUserRoleId = input.organizationUserRoleId ?? ''
    this.pathToRedirect = input.pathToRedirect ?? ''
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validateId(input: { id: string; key: string }) {
    const idErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.uuid('El valor de este campo es inválido.'),
      ),
      input.id,
    )
    if (idErr.issues) {
      this.error[input.key as keyof typeof this.error] = idErr.issues[0].message
    }
  }

  validateFirstName() {
    const firstNameErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(2, 'Por favor, escribe un poco más.'),
      ),
      this.firstName,
    )
    if (firstNameErr.issues) {
      this.error.firstName = firstNameErr.issues[0].message
    }
  }

  validateLastName() {
    if (this.lastName.length > 0) {
      const lastNameErr = v.safeParse(
        v.pipe(
          v.string('El valor de este campo es inválido.'),
          v.trim(),
          // v.nonEmpty('Este campo es requerido.'),
          v.minLength(2, 'Por favor, escribe un poco más.'),
        ),
        this.lastName,
      )
      if (lastNameErr.issues) {
        this.error.lastName = lastNameErr.issues[0].message
      }
    }
  }

  validateEmail() {
    const emailErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.email('El valor que has ingresado no corresponde a un email válido.'),
      ),
      this.email,
    )
    if (emailErr.issues) {
      this.error.email = emailErr.issues[0].message
    }
  }

  validateIsConfirmed() {
    if (!this.isConfirmed) {
      this.error.isConfirmed = 'Si vas a eliminar, por favor, confirma.'
    }
  }

  validatePathToRedirect() {
    const pathToRedirectErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(3, 'Por favor, escribe un poco más.'),
      ),
      this.pathToRedirect,
    )
    if (pathToRedirectErr.issues) {
      this.error.pathToRedirect = pathToRedirectErr.issues[0].message
    }
  }

  validateForm() {
    if (Object.keys(this.error).length > 0) {
      throw new Error()
    }
  }

  validateFormToCreate() {
    this.validateFirstName()
    this.validateLastName()
    this.validateEmail()
    this.validateForm()
  }

  validateFormToUpdate() {
    this.validateId({ id: this.userId, key: 'userId' })
    this.validateFirstName()
    this.validateLastName()
    this.validateEmail()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validateId({ id: this.userId, key: 'userId' })
    this.validateIsConfirmed()
    this.validateForm()
  }

  validateFormToCreateRelation() {
    this.validateId({ id: this.userId, key: 'userId' })
    this.validateId({ id: this.organizationId, key: 'organizationId' })
    this.validateId({ id: this.roleId, key: 'roleId' })
    this.validatePathToRedirect
    this.validateForm()
  }

  validateFormToDeleteRelation() {
    this.validateId({ id: this.organizationUserRoleId, key: 'organizationUserRoleId' })
    this.validateIsConfirmed()
    this.validateForm()
  }

  async create() {
    try {
      await db.insert(personTable).values({
        firstName: this.firstName,
        lastName: this.lastName || null,
        email: this.email,
        isActive: this.status,
      })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de usuario.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async createOrganizatioUserRole() {
    try {
      await db.insert(organizationPersonRoleTable).values({
        organizationId: this.organizationId,
        personId: this.userId,
        roleId: this.roleId,
        isSelected: false,
      })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de organización - usuario - rol.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAll() {
    try {
      this.users = await db
        .select({
          id: personTable.id,
          firstName: personTable.firstName,
          lastName: personTable.lastName,
          email: personTable.email,
          isActive: personTable.isActive,
        })
        .from(personTable)
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todos los usuarios.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readOneByIdWithOrganizationsAndRoles(userId: string) {
    try {
      const user = await db
        .select({
          id: personTable.id,
          firstName: personTable.firstName,
          lastName: personTable.lastName,
          email: personTable.email,
          isActive: personTable.isActive,
        })
        .from(personTable)
        .where(eq(personTable.id, userId))
      const organizationsAndRoles = await db
        .select({
          id: organizationPersonRoleTable.id,
          organizationId: organizationPersonRoleTable.organizationId,
          organizationTitle: organizationTable.title,
          roleId: organizationPersonRoleTable.roleId,
          roleTitle: roleTable.title,
          isSelected: organizationPersonRoleTable.isSelected,
        })
        .from(organizationPersonRoleTable)
        .where(eq(organizationPersonRoleTable.personId, userId))
        .innerJoin(
          organizationTable,
          eq(organizationPersonRoleTable.organizationId, organizationTable.id),
        )
        .innerJoin(roleTable, eq(organizationPersonRoleTable.roleId, roleTable.id))
      const missingOrganizationsAndRoles = await db.execute(
        sql`
          SELECT o.id AS "organizationId", o.title AS "organizationTitle", r.id AS "roleId", r.title AS "roleTitle"
          FROM ${organizationTable} o
          CROSS JOIN ${roleTable} r
          WHERE NOT EXISTS (
            SELECT 1 FROM ${organizationPersonRoleTable} orr
            WHERE orr.organization_id = o.id AND orr.role_id = r.id
          )
          `,
      )
      this.userAndOrganizationsAndRoles = {
        ...user[0],
        organizationsAndRoles,
        missingOrganizationsAndRoles: missingOrganizationsAndRoles.rows,
      }
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener un usuario con sus ogreanizaciones y roles.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async update() {
    try {
      await db
        .update(personTable)
        .set({
          firstName: this.firstName,
          lastName: this.lastName || null,
          email: this.email,
          isActive: this.status,
        })
        .where(eq(personTable.id, this.userId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización de usuario.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async delete() {
    try {
      await db.delete(personTable).where(eq(personTable.id, this.userId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de usuario.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async deleteOrganizationUserRole() {
    try {
      await db
        .delete(organizationPersonRoleTable)
        .where(eq(organizationPersonRoleTable.id, this.organizationUserRoleId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de organización - usuario - rol.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

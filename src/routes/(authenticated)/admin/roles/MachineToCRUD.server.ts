import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import db from '~/lib/server/db'
import { rolePermissionTable, roleTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class MachineToCRUD {
  roleId: string
  title: string
  isConfirmed: boolean
  error: {
    roleId?: string
    title?: string
    isConfirmed?: string
    server?: string
  } = {}
  roles: any[] = []
  roleAndPermissions?: {
    id: string
    title: string
    permissions: {
      id: string
      title: string
    }[]
  }

  constructor(input: { title: string })
  constructor()
  constructor(input: { roleId: string; title: string })
  constructor(input: { isConfirmed: boolean; roleId: string })

  constructor(
    input: {
      roleId?: string
      title?: string
      status?: boolean
      isConfirmed?: boolean
    } = {},
  ) {
    this.roleId = input.roleId ?? ''
    this.title = input.title ?? ''
    this.isConfirmed = input.isConfirmed ?? false
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validateRoleId() {
    const roleIdErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.uuid('El valor de este campo es inválido.'),
      ),
      this.roleId,
    )
    if (roleIdErr.issues) {
      this.error.roleId = roleIdErr.issues[0].message
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

  validateIsConfirmed() {
    if (!this.isConfirmed) {
      this.error.isConfirmed = 'Si vas a eliminar, por favor, confirma.'
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
    this.validateRoleId()
    this.validateTitle()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validateRoleId()
    this.validateIsConfirmed()
    this.validateForm()
  }

  async create() {
    try {
      await db.insert(roleTable).values({ title: this.title })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de rol.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAll() {
    try {
      this.roles = await db
        .select({
          id: roleTable.id,
          title: roleTable.title,
        })
        .from(roleTable)
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todas los roles.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAllWithPermissions() {
    let query: any[] = []
    try {
      query = await db
        .select({
          id: roleTable.id,
          title: roleTable.title,
          permissionId: rolePermissionTable.permissionId,
        })
        .from(roleTable)
        .leftJoin(rolePermissionTable, eq(rolePermissionTable.permissionId, roleTable.id))
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todos los roles con sus permisos.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    this.roles = query.reduce(
      (roles, item: any) => {
        const role = roles.find((p: any) => p.id === item.id)
        if (role) {
          if (item.roleId) {
            role.permissions.push(item.roleId)
          }
        } else {
          roles.push({
            id: item.id,
            title: item.title,
            permissions: item.permissionId ? [item.permissionId] : [],
          })
        }
        return roles
      },
      [] as { id: string; title: string; permissions: string[] }[],
    )
  }

  async readOneByIdWithPermissions(roleId: string) {
    try {
      const role = await db
        .select({
          id: roleTable.id,
          title: roleTable.title,
        })
        .from(roleTable)
        .where(eq(roleTable.id, roleId))
      const permissions = await db
        .select({
          id: rolePermissionTable.roleId,
          title: roleTable.title,
          rolePermissionId: rolePermissionTable.id,
        })
        .from(rolePermissionTable)
        .where(eq(rolePermissionTable.permissionId, roleId))
        .innerJoin(roleTable, eq(roleTable.id, rolePermissionTable.roleId))
      this.roleAndPermissions = { ...role[0], permissions }
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener un permiso con sus roles.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async update() {
    try {
      await db
        .update(roleTable)
        .set({
          title: this.title,
        })
        .where(eq(roleTable.id, this.roleId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización de rol.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async delete() {
    try {
      await db.delete(roleTable).where(eq(roleTable.id, this.roleId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de rol.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

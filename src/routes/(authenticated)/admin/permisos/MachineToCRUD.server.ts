import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import db from '~/lib/server/db'
import { permissionTable, rolePermissionTable, roleTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class MachineToCRUD {
  permissionId: string
  path: string
  type: string
  isConfirmed: boolean
  error: {
    permissionId?: string
    path?: string
    type?: string
    isConfirmed?: string
    server?: string
  } = {}
  permissions: any[] = []
  permissionAndRoles?: {
    id: string
    path: string
    type: string
    roles: {
      id: string
      title: string
      rolePermissionId: string
    }[]
  }

  constructor(input: { path: string; type: string })
  constructor()
  constructor(input: { permissionId: string; path: string; type: string })
  constructor(input: { isConfirmed: boolean; permissionId: string })

  constructor(
    input: {
      permissionId?: string
      path?: string
      type?: string
      isConfirmed?: boolean
    } = {},
  ) {
    this.permissionId = input.permissionId ?? ''
    this.path = input.path ?? ''
    this.type = input.type ?? ''
    this.isConfirmed = input.isConfirmed ?? false
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validatePermissionId() {
    const permissionIdErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.uuid('El valor de este campo es inválido.'),
      ),
      this.permissionId,
    )
    if (permissionIdErr.issues) {
      this.error.permissionId = permissionIdErr.issues[0].message
    }
  }

  validatePath() {
    const pathErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(3, 'Por favor, escribe un poco más.'),
      ),
      this.path,
    )
    if (pathErr.issues) {
      this.error.path = pathErr.issues[0].message
    }
  }

  validateType() {
    if (!this.type) {
      this.error.type = 'Este campo es requerido.'
    } else if (this.type !== 'api' && this.type !== 'view') {
      this.error.type = 'El valor de este campo es inválido.'
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
    this.validatePath()
    this.validateType()
    this.validateForm()
  }

  validateFormToUpdate() {
    this.validatePermissionId()
    this.validatePath()
    this.validateType()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validatePermissionId()
    this.validateIsConfirmed()
    this.validateForm()
  }

  async create() {
    try {
      await db.insert(permissionTable).values({ path: this.path, type: this.type })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de permiso.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAll() {
    try {
      this.permissions = await db
        .select({
          id: permissionTable.id,
          path: permissionTable.path,
          type: permissionTable.type,
        })
        .from(permissionTable)
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todos los permisos.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAllWithRoles() {
    let query: any[] = []
    try {
      query = await db
        .select({
          id: permissionTable.id,
          path: permissionTable.path,
          type: permissionTable.type,
          roleId: rolePermissionTable.roleId,
        })
        .from(permissionTable)
        .leftJoin(rolePermissionTable, eq(rolePermissionTable.permissionId, permissionTable.id))
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todos los permisos con sus roles.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    this.permissions = query.reduce(
      (permissions, item: any) => {
        const permission = permissions.find((p: any) => p.id === item.id)
        if (permission) {
          if (item.roleId) {
            permission.roles.push(item.roleId)
          }
        } else {
          permissions.push({
            id: item.id,
            path: item.path,
            type: item.type,
            roles: item.roleId ? [item.roleId] : [],
          })
        }
        return permissions
      },
      [] as { id: string; path: string; type: string; roles: string[] }[],
    )
  }

  async readOneByIdWithRoles(permissionId: string) {
    try {
      const permisson = await db
        .select({
          id: permissionTable.id,
          path: permissionTable.path,
          type: permissionTable.type,
        })
        .from(permissionTable)
        .where(eq(permissionTable.id, permissionId))
      const roles = await db
        .select({
          id: rolePermissionTable.roleId,
          title: roleTable.title,
          rolePermissionId: rolePermissionTable.id,
        })
        .from(rolePermissionTable)
        .where(eq(rolePermissionTable.permissionId, permissionId))
        .innerJoin(roleTable, eq(roleTable.id, rolePermissionTable.roleId))
      this.permissionAndRoles = { ...permisson[0], roles }
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener un permiso con sus roles.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async update() {
    try {
      await db
        .update(permissionTable)
        .set({
          path: this.path,
          type: this.type,
        })
        .where(eq(permissionTable.id, this.permissionId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización de permiso.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async delete() {
    try {
      await db.delete(permissionTable).where(eq(permissionTable.id, this.permissionId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de permiso.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

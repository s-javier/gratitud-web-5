import * as v from 'valibot'
import { eq, inArray, isNull, not, or } from 'drizzle-orm'
import db from '~/lib/server/db'
import {
  menupageTable,
  permissionTable,
  rolePermissionTable,
  roleTable,
} from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class MachineToCRUD {
  permissionId: string
  path: string
  type: string
  isConfirmed: boolean
  menupageId: string
  menupageTitle: string
  pathToRedirect: string
  error: {
    permissionId?: string
    path?: string
    type?: string
    isConfirmed?: string
    menupageId?: string
    menupageTitle?: string
    pathToRedirect?: string
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
    missingRoles: {
      id: string
      title: string
    }[]
  }

  constructor(input: { path: string; type: string })
  constructor()
  constructor(input: { permissionId: string; path: string; type: string })
  constructor(input: { isConfirmed: boolean; permissionId: string })
  constructor(input: {
    permissionId: string
    menupageId: string
    menupageTitle: string
    pathToRedirect: string
  })
  constructor(input: { isConfirmed: boolean; menupageId: string; pathToRedirect: string })

  constructor(
    input: {
      permissionId?: string
      path?: string
      type?: string
      isConfirmed?: boolean
      menupageId?: string
      menupageTitle?: string
      pathToRedirect?: string
    } = {},
  ) {
    this.permissionId = input.permissionId ?? ''
    this.path = input.path ?? ''
    this.type = input.type ?? ''
    this.isConfirmed = input.isConfirmed ?? false
    this.menupageId = input.menupageId ?? ''
    this.menupageTitle = input.menupageTitle ?? ''
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

  validateMenupageTitle() {
    const titleErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(2, 'Por favor, escribe un poco más.'),
      ),
      this.menupageTitle,
    )
    if (titleErr.issues) {
      this.error.menupageTitle = titleErr.issues[0].message
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
    this.validatePath()
    this.validateType()
    this.validateForm()
  }

  validateFormToUpdate() {
    this.validateId({ id: this.permissionId, key: 'permissionId' })
    this.validatePath()
    this.validateType()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validateId({ id: this.permissionId, key: 'permissionId' })
    this.validateIsConfirmed()
    this.validateForm()
  }

  validateFormToUpdateMenupage() {
    this.validateId({ id: this.permissionId, key: 'permissionId' })
    if (this.menupageId) {
      this.validateId({ id: this.menupageId, key: 'menupageId' })
    }
    this.validateMenupageTitle()
    this.validatePathToRedirect()
    this.validateForm()
  }

  validateFormToDeleteMenupage() {
    this.validateIsConfirmed()
    this.validateId({ id: this.menupageId, key: 'menupageId' })
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

  async createMenupage() {
    let query
    try {
      query = await db
        .select({
          menupageId: menupageTable.id,
        })
        .from(menupageTable)
        .where(eq(menupageTable.permissionId, this.permissionId))
    } catch (err: any) {
      rollbar.error('Error en DB. Consulta de menupage por permissionId.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      return
    }
    if (query.length > 0) {
      this.error.server =
        'Hubo un error al editar el menú. Por favor, inténtalo de nuevo o más tarde.'
      return
    }
    try {
      await db
        .insert(menupageTable)
        .values({ permissionId: this.permissionId, title: this.menupageTitle })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de menupage.', err)
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
      const missingRoles = await db
        .selectDistinct({
          id: roleTable.id,
          title: roleTable.title,
        })
        .from(roleTable)
        .leftJoin(rolePermissionTable, eq(rolePermissionTable.roleId, roleTable.id))
        .where(
          or(
            not(
              inArray(
                rolePermissionTable.roleId,
                roles.map((r: any) => r.id),
              ),
            ),
            isNull(rolePermissionTable.permissionId),
          ),
        )
      this.permissionAndRoles = { ...permisson[0], roles, missingRoles }
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

  async updateMenupage() {
    try {
      await db
        .update(menupageTable)
        .set({
          title: this.menupageTitle,
        })
        .where(eq(menupageTable.id, this.menupageId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización de menupage.', err)
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

  async deleteMenupage() {
    try {
      await db.delete(menupageTable).where(eq(menupageTable.id, this.menupageId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de menupage.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

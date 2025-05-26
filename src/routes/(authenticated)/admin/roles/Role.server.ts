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
  roleId: string
  title: string
  isConfirmed: boolean
  permissionId: string
  permissionType: string
  order: number
  rolePermissionId: string
  pathToRedirect: string
  error: {
    roleId?: string
    title?: string
    isConfirmed?: string
    permissionId?: string
    permissionType?: string
    order?: string
    pathToRedirect?: string
    server?: string
  } = {}
  roles: any[] = []
  roleAndPermissions?: {
    id: string
    title: string
    permissions: {
      id: string
      path: string
      type: string
      rolePermissionId: string
    }[]
    missingPermissions: {
      id: string
      path: string
      type: string
    }[]
  }

  constructor(input: { title: string })
  constructor()
  constructor(input: { roleId: string; title: string })
  constructor(input: { isConfirmed: boolean; roleId: string })
  constructor(input: {
    roleId: string
    permissionId: string
    permissionType: string
    order: number
    pathToRedirect: string
  })
  constructor(input: { rolePermissionId: string; isConfirmed: boolean; pathToRedirect: string })
  constructor(input: { rolePermissionId: string; order: number; pathToRedirect: string })

  constructor(
    input: {
      roleId?: string
      title?: string
      status?: boolean
      isConfirmed?: boolean
      permissionId?: string
      permissionType?: string
      order?: number
      rolePermissionId?: string
      pathToRedirect?: string
    } = {},
  ) {
    this.roleId = input.roleId ?? ''
    this.title = input.title ?? ''
    this.isConfirmed = input.isConfirmed ?? false
    this.permissionId = input.permissionId ?? ''
    this.permissionType = input.permissionType ?? ''
    this.order = input.order ?? 0
    this.rolePermissionId = input.rolePermissionId ?? ''
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

  validateType() {
    if (!this.permissionType) {
      this.error.permissionType = 'Este campo es requerido.'
    } else if (this.permissionType !== 'api' && this.permissionType !== 'view') {
      this.error.permissionType = 'El valor de este campo es inválido.'
    }
  }

  validateOrder() {
    const orderErr = v.safeParse(
      v.pipe(
        v.number('El valor de este campo es inválido.'),
        v.minValue(1, 'El valor de este campo debe ser mayor a 0.'),
        v.maxValue(99, 'El valor de este campo debe ser menor a 100.'),
      ),
      this.order,
    )
    if (orderErr.issues) {
      this.error.order = orderErr.issues[0].message
    }
  }

  validateForm() {
    if (Object.keys(this.error).length > 0) {
      throw new Error()
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

  validateFormToCreate() {
    this.validateTitle()
    this.validateForm()
  }

  validateFormToCreateRelationWithPermission() {
    this.validateId({ id: this.roleId, key: 'roleId' })
    this.validateType()
    this.validateId({ id: this.permissionId, key: 'permissionId' })
    if (this.permissionType === 'view') {
      this.validateOrder()
    }
    this.validatePathToRedirect()
    this.validateForm()
  }

  validateFormToUpdate() {
    this.validateId({ id: this.roleId, key: 'roleId' })
    this.validateTitle()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validateId({ id: this.roleId, key: 'roleId' })
    this.validateIsConfirmed()
    this.validateForm()
  }

  validateFormToDeleteRelationRolePermission() {
    this.validateId({ id: this.rolePermissionId, key: 'rolePermissionId' })
    this.validateIsConfirmed()
    this.validateForm()
  }

  validateFormToUpdateRolePermissionOrder() {
    this.validateId({ id: this.rolePermissionId, key: 'rolePermissionId' })
    this.validateOrder()
    this.validatePathToRedirect()
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

  async createRelationWithPermission() {
    try {
      await db.insert(rolePermissionTable).values({
        roleId: this.roleId,
        permissionId: this.permissionId,
        sort: this.permissionType === 'view' ? this.order : null,
      })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de relación de rol con permiso.', err)
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
        .leftJoin(rolePermissionTable, eq(rolePermissionTable.roleId, roleTable.id))
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todos los roles con sus permisos.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    this.roles = query.reduce(
      (roles, item: any) => {
        const role = roles.find((p: any) => p.id === item.id)
        if (role) {
          if (item.permissionId) {
            role.permissions.push(item.permissionId)
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
          id: permissionTable.id,
          path: permissionTable.path,
          type: permissionTable.type,
          rolePermissionId: rolePermissionTable.id,
          sort: rolePermissionTable.sort,
          menupageId: menupageTable.id,
          menupageTitle: menupageTable.title,
        })
        .from(rolePermissionTable)
        .where(eq(rolePermissionTable.roleId, roleId))
        .innerJoin(permissionTable, eq(rolePermissionTable.permissionId, permissionTable.id))
        .leftJoin(menupageTable, eq(permissionTable.id, menupageTable.permissionId))
      const missingPermissions = await db
        .selectDistinct({
          id: permissionTable.id,
          path: permissionTable.path,
          type: permissionTable.type,
        })
        .from(permissionTable)
        .leftJoin(rolePermissionTable, eq(rolePermissionTable.permissionId, permissionTable.id))
        .where(
          or(
            not(
              inArray(
                rolePermissionTable.permissionId,
                permissions.map((r: any) => r.id),
              ),
            ),
            isNull(rolePermissionTable.roleId),
          ),
        )
      this.roleAndPermissions = { ...role[0], permissions, missingPermissions }
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener un rol con sus permisos.', err)
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

  async updateRolePermissionOrder() {
    try {
      await db
        .update(rolePermissionTable)
        .set({
          sort: this.order,
        })
        .where(eq(rolePermissionTable.id, this.rolePermissionId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización orden en relación de rol con permiso.', err)
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

  async deleteRelationRolePermission() {
    try {
      await db.delete(rolePermissionTable).where(eq(rolePermissionTable.id, this.rolePermissionId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de relación de rol con permiso.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

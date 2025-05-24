import { redirect, type RequestEvent } from '@sveltejs/kit'
import Role from '~/routes/(authenticated)/admin/roles/Role.server'
import Permission from '~/routes/(authenticated)/admin/permisos/Permission.server'

export async function load(event: RequestEvent) {
  const machine = new Role()
  try {
    await machine.readOneByIdWithPermissions(event.params.roleId || '')
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { roleAndPermissions: machine.roleAndPermissions }
}

export const actions = {
  'add-relation-role-permission': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const roleId = formData.get('roleId')?.toString() || ''
    const permissionId = formData.get('permissionId')?.toString() || ''
    const permissionType = formData.get('permissionType')?.toString() || ''
    const sort = parseInt(formData.get('sort')?.toString() || '0')
    const path = formData.get('path')?.toString() || ''

    const machine = new Role({
      roleId,
      permissionId,
      sort,
      permissionType,
      pathToRedirect: path,
    })
    try {
      machine.validateFormToCreateRelationWithPermission()
      await machine.createRelationWithPermission()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
  'delete-relation-role-permission': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const rolePermissionId = formData.get('rolePermissionId')?.toString() || ''
    const path = formData.get('path')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false

    const machine = new Role({ rolePermissionId, pathToRedirect: path, isConfirmed })
    try {
      machine.validateFormToDeleteRelationRolePermission()
      await machine.deleteRelationRolePermission()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
  'edit-menu': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const permissionId = formData.get('permissionId')?.toString() || ''
    const menupageId = formData.get('menupageId')?.toString() || ''
    const menupageTitle = formData.get('menupageTitle')?.toString() || ''
    const path = formData.get('path')?.toString() || ''

    const machine = new Permission({
      permissionId,
      menupageId,
      menupageTitle,
      pathToRedirect: path,
    })
    try {
      machine.validateFormToUpdateMenupage()
      if (menupageId) {
        await machine.updateMenupage()
      } else {
        await machine.createMenupage()
      }
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
  'delete-menu': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const menupageId = formData.get('menupageId')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false
    const path = formData.get('path')?.toString() || ''

    if (!menupageId) {
      return { error: { server: 'No puedes eliminar un menú que no existe.' } }
    }

    const machine = new Permission({ isConfirmed, menupageId, pathToRedirect: path })
    try {
      machine.validateFormToDeleteMenupage()
      await machine.deleteMenupage()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
}

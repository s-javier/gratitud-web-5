import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToCRUD from '~/routes/(authenticated)/admin/roles/MachineToCRUD.server'

export async function load(event: RequestEvent) {
  const machine = new MachineToCRUD()
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

    const machine = new MachineToCRUD({
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

    const machine = new MachineToCRUD({ rolePermissionId, pathToRedirect: path, isConfirmed })
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
    const menuId = formData.get('menuId')?.toString() || ''
    const path = formData.get('path')?.toString() || ''
  },
  'delete-menu': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const menuId = formData.get('menuId')?.toString() || ''
    const path = formData.get('path')?.toString() || ''
  },
}

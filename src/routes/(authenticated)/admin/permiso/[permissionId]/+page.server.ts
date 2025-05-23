import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToCRUDFromPermission from '~/routes/(authenticated)/admin/permisos/MachineToCRUD.server'
import MachineToCRUDFromRole from '~/routes/(authenticated)/admin/roles/MachineToCRUD.server'

export async function load(event: RequestEvent) {
  const machine = new MachineToCRUDFromPermission()
  try {
    await machine.readOneByIdWithRoles(event.params.permissionId || '')
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { permissionAndRoles: machine.permissionAndRoles }
}

export const actions = {
  'add-relation-role-permission': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const roleId = formData.get('roleId')?.toString() || ''
    const permissionId = formData.get('permissionId')?.toString() || ''
    const permissionType = formData.get('permissionType')?.toString() || ''
    const sort = parseInt(formData.get('sort')?.toString() || '0')
    const path = formData.get('path')?.toString() || ''

    const machine = new MachineToCRUDFromRole({
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

    const machine = new MachineToCRUDFromRole({
      rolePermissionId,
      pathToRedirect: path,
      isConfirmed,
    })
    try {
      machine.validateFormToDeleteRelationRolePermission()
      await machine.deleteRelationRolePermission()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
}

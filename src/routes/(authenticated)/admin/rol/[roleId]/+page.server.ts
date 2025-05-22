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
    const path = formData.get('path')?.toString() || ''

    const machine = new MachineToCRUD({ roleId, permissionId, pathToRedirect: path })
    try {
      machine.validateFormToCreateRelationWithPermission()
      await machine.createRelationWithPermission()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
}

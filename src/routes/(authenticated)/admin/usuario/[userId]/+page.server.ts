import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import User from '~/routes/(authenticated)/admin/usuarios/User.server'

export async function load(event: RequestEvent) {
  const machine = new User()
  try {
    await machine.readOneByIdWithOrganizationsAndRoles(event.params.userId || '')
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { userAndOrganizationsAndRoles: machine.userAndOrganizationsAndRoles }
}

export const actions = {
  'add-relation': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const userId = formData.get('userId')?.toString() || ''
    const organizationId = formData.get('organizationId')?.toString() || ''
    const roleId = formData.get('roleId')?.toString() || ''
    const path = formData.get('path')?.toString() || ''
    console.log({ userId, organizationId, roleId, path })

    const machine = new User({ organizationId, userId, roleId, pathToRedirect: path })
    try {
      machine.validateFormToCreateRelation()
      await machine.createOrganizatioUserRole()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
  'delete-relation': async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false
    const organizationUserRoleId = formData.get('organizationUserRoleId')?.toString() || ''
    const path = formData.get('path')?.toString() || ''

    const machine = new User({ isConfirmed, organizationUserRoleId, pathToRedirect: path })
    try {
      machine.validateFormToDeleteRelation()
      await machine.deleteOrganizationUserRole()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, path)
  },
}

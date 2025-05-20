import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToCRUD from './MachineToCRUD.server'

export async function load() {
  const machine = new MachineToCRUD()
  try {
    await machine.readAllWithRoles()
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { permissions: machine.permissions }
}

export const actions = {
  add: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const path = formData.get('path')?.toString() || ''
    const type = formData.get('type')?.toString() || ''

    const machine = new MachineToCRUD({ path, type })
    try {
      machine.validateFormToCreate()
      await machine.create()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_PERMISSIONS)
  },

  edit: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const permissionId = formData.get('permissionId')?.toString() || ''
    const path = formData.get('path')?.toString() || ''
    const type = formData.get('type')?.toString() || ''

    const machine = new MachineToCRUD({ permissionId, path, type })
    try {
      machine.validateFormToUpdate()
      await machine.update()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_PERMISSIONS)
  },

  delete: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const permissionId = formData.get('permissionId')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false

    const machine = new MachineToCRUD({ isConfirmed, permissionId })
    try {
      machine.validateFormToDelete()
      await machine.delete()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_PERMISSIONS)
  },
}

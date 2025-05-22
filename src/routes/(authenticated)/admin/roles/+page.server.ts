import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToCRUD from './MachineToCRUD.server'

export async function load(event: RequestEvent) {
  const machine = new MachineToCRUD()
  try {
    await machine.readAllWithPermissions()
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { roles: machine.roles }
}

export const actions = {
  add: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const title = formData.get('title')?.toString() || ''

    const machine = new MachineToCRUD({ title })
    try {
      machine.validateFormToCreate()
      await machine.create()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_ROLES)
  },

  edit: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const roleId = formData.get('roleId')?.toString() || ''
    const title = formData.get('title')?.toString() || ''

    const machine = new MachineToCRUD({ roleId, title })
    try {
      machine.validateFormToUpdate()
      await machine.update()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_ROLES)
  },

  delete: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const roleId = formData.get('roleId')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false

    const machine = new MachineToCRUD({ isConfirmed, roleId })
    try {
      machine.validateFormToDelete()
      await machine.delete()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_ROLES)
  },
}

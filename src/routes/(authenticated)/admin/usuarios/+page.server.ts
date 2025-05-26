import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import User from './User.server'

export async function load(event: RequestEvent) {
  const machine = new User()
  try {
    await machine.readAll()
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { users: machine.users }
}

export const actions = {
  add: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const firstName = formData.get('firstName')?.toString() || ''
    const lastName = formData.get('lastName')?.toString() || ''
    const email = formData.get('email')?.toString() || ''
    const status = formData.get('status')?.toString() === 'true' || false
    console.log({ firstName, lastName, email, status })

    const machine = new User({ firstName, lastName, email, status })
    try {
      machine.validateFormToCreate()
      await machine.create()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_USERS)
  },
  edit: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const userId = formData.get('userId')?.toString() || ''
    const firstName = formData.get('firstName')?.toString() || ''
    const lastName = formData.get('lastName')?.toString() || ''
    const email = formData.get('email')?.toString() || ''
    const status = formData.get('status')?.toString() === 'true' || false

    const machine = new User({ userId, firstName, lastName, email, status })
    try {
      machine.validateFormToUpdate()
      await machine.update()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_USERS)
  },
  delete: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const userId = formData.get('userId')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false

    const machine = new User({ isConfirmed, userId })
    try {
      machine.validateFormToDelete()
      await machine.delete()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    throw redirect(303, Page.ADMIN_USERS)
  },
}

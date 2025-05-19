import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToChange from './MachineToChange.server'
import MachineToCRUD from './MachineToCRUD.server'

export async function load(event: RequestEvent) {
  const machine = new MachineToCRUD()
  try {
    await machine.readAll()
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { organizations: machine.organizations }
}

export const actions = {
  change: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const organizationId = data.get('organizationId')?.toString() || ''

    const machine = new MachineToChange(
      event.locals.userId,
      event.locals.organizationId,
      organizationId,
    )
    try {
      machine.validateOrganizationId()
      await machine.getOrganizationToChange()
      await machine.enableNewOrganization()
      await machine.disableOldOrganization()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    redirect(303, Page.ADMIN_WELCOME)
  },
  add: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const title = formData.get('title')?.toString() || ''
    const status = formData.get('status')?.toString() === 'true' || false

    const machine = new MachineToCRUD({ title, status })
    try {
      machine.validateFormToCreate()
      await machine.create()
    } catch {}

    if (machine.hasError()) {
      return {
        error: machine.error,
      }
    }

    redirect(303, Page.ADMIN_ORGANIZATIONS)
  },
  edit: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const organizationId = formData.get('organizationId')?.toString() || ''
    const title = formData.get('title')?.toString() || ''
    const status = formData.get('status')?.toString() === 'true' || false

    const machine = new MachineToCRUD({ organizationId, title, status })
    try {
      machine.validateFormToUpdate()
      await machine.update()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }

    redirect(303, Page.ADMIN_ORGANIZATIONS)
  },
  delete: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const organizationId = formData.get('organizationId')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false

    const machine = new MachineToCRUD({ isConfirmed, organizationId })
    try {
      machine.validateFormToDelete()
      await machine.delete()
    } catch {}

    if (machine.hasError()) {
      return {
        error: machine.error,
      }
    }

    redirect(303, Page.ADMIN_ORGANIZATIONS)
  },
}

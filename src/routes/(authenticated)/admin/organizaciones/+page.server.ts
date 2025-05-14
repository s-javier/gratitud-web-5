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
    const auxOrganizationId = data.get('organizationId')
    const organizationId: string = typeof auxOrganizationId === 'string' ? auxOrganizationId : ''

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
    const data = await event.request.formData()
    const auxTitle = data.get('title')
    const title: string = typeof auxTitle === 'string' ? auxTitle : ''
    const auxStatus = data.get('status')
    const status: boolean = auxStatus === 'true'
    // console.log({
    //   title,
    //   status,
    // })

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
    const data = await event.request.formData()
    const auxOrganizationId = data.get('organizationId')
    const organizationId: string = typeof auxOrganizationId === 'string' ? auxOrganizationId : ''
    const auxTitle = data.get('title')
    const title: string = typeof auxTitle === 'string' ? auxTitle : ''
    const auxStatus = data.get('status')
    const status: boolean = auxStatus === 'true'
    // console.log({
    //   organizationId,
    //   title,
    //   status,
    // })

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
    const data = await event.request.formData()
    const auxOrganizationId = data.get('organizationId')
    const organizationId: string = typeof auxOrganizationId === 'string' ? auxOrganizationId : ''

    const machine = new MachineToCRUD({ organizationId })

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

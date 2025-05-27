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
    //
  },
  'delete-relation': async (event: RequestEvent) => {
    //
  },
}

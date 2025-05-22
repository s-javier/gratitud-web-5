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

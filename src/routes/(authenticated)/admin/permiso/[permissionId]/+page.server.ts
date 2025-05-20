import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToCRUD from '~/routes/(authenticated)/admin/permisos/MachineToCRUD.server'

export async function load(event: RequestEvent) {
  const machine = new MachineToCRUD()
  try {
    await machine.readOneByIdWithRoles(event.params.permissionId || '')
  } catch {}
  if (machine.hasError()) {
    return { error: machine.error }
  }
  return { permissionAndRoles: machine.permissionAndRoles }
}

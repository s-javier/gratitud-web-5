import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineFromRoleToCRUD from '~/routes/(authenticated)/admin/roles/MachineToCRUD.server'
import MachineFromPermissionToCRUD from '~/routes/(authenticated)/admin/permisos/MachineToCRUD.server'

export async function load(event: RequestEvent) {
  console.log(event.params.roleId)
  // const machineFromRole = new MachineFromRoleToCRUD()
  // const machineFromPermission = new MachineFromPermissionToCRUD()
  // try {
  //   await machineFromRole.readOne(event.params.roleId)
  //   await machineFromPermissions.readByRoleId(event.params.roleId)
  // } catch {}
  // if (machine.hasError()) {
  //   return { error: machine.error }
  // }
  // return { role: machineFromRole.role, permissions: machineFromPermissions.permissions }
}

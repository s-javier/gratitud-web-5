import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import MachineToCRUD from './MachineToCRUD.server'

export async function load(event: RequestEvent) {
  console.log(event.params.roleId)
  // const machine = new MachineToCRUD()
  // try {
  //   await machine.readAll()
  // } catch {}
  // if (machine.hasError()) {
  //   return { error: machine.error }
  // }
  // return { roles: machine.roles }
}

import { type RequestEvent, redirect } from '@sveltejs/kit'
import { Page } from '~/enums'
import Machine from './Machine.server'

export function load(event: RequestEvent) {
  if (event.cookies.get('token')) {
    redirect(303, Page.ADMIN_WELCOME)
  }
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxEmail = data.get('email')
    const email: string = typeof auxEmail === 'string' ? auxEmail : ''

    const machine = new Machine(email)
    try {
      machine.validateForm()
      await machine.getUser()
      machine.validateUserIsActtive()
      await machine.createSession()
      await machine.sendEmail()
    } catch {}

    if (machine.getIsError()) {
      return { error: machine.error }
    }
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, Page.CODE)
  },
}

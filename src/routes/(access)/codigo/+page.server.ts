import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import { NODE_ENV } from '$env/static/private'
import Machine from './Machine.server'

export function load(event: RequestEvent) {
  if (event.cookies.get('token')) {
    redirect(303, Page.ADMIN_WELCOME)
  }
  if (event.cookies.get('login') === undefined || event.cookies.get('login') !== 'true') {
    redirect(303, Page.LOGIN)
  }
  event.cookies.delete('login', { path: '/' })
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    if (NODE_ENV === 'development') {
      console.info('Formulario de código:', data)
    }
    const auxTimeLimit = data.get('timeLimit')
    const timeLimit: string = typeof auxTimeLimit === 'string' ? auxTimeLimit : '0'
    const auxCode = data.get('otp')
    const code: string = typeof auxCode === 'string' ? auxCode : ''

    const machine = new Machine(timeLimit, code)
    try {
      machine.validateForm()
      await machine.getSession()
      machine.validateCodeIsActive()
      machine.validateCodeExpiration()
      await machine.disableCodeAndActiveSession()
      await machine.disableMultipleSessions()
    } catch {}

    if (machine.hasError()) {
      return { error: machine.error }
    }
    event.cookies.set('token', machine.session.id, { path: '/' })
    redirect(303, Page.ADMIN_WELCOME)
  },
}

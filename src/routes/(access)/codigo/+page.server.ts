import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import { NODE_ENV } from '$env/static/private'
import Auth from '~/lib/server/Auth'

export function load(event: RequestEvent) {
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

    const auth = new Auth({ timeLimit, code })
    try {
      auth.validateTimeLimitAndCode()
      await auth.getSessionFromCode()
      auth.validateCodeStatus()
      auth.validateCodeExpiration()
      await auth.disableCodeAndActiveSession()
      await auth.disableMultipleSessions()
    } catch {}

    if (auth.hasError()) {
      return { error: auth.error }
    }
    event.cookies.set('token', auth.session.id!, { path: '/' })
    redirect(303, Page.ADMIN_WELCOME)
  },
}

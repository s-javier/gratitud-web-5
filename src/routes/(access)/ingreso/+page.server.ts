import { type RequestEvent, redirect } from '@sveltejs/kit'
import { Page } from '~/enums'
import Auth from '~/lib/server/Auth'

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxEmail = data.get('email')
    const email: string = typeof auxEmail === 'string' ? auxEmail : ''

    const auth = new Auth({ email })
    try {
      await auth.validateEmail()
      await auth.getUserFromLogin()
      auth.validateUserStatusFromLogin()
      await auth.createSession()
      await auth.sendEmail()
    } catch {}

    if (auth.hasError()) {
      return { error: auth.error }
    }
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, Page.CODE)
  },
}

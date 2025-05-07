import { NODE_ENV } from '$env/static/private'
import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'
import Auth from '~/lib/server/Auth'

export async function load(event: RequestEvent) {
  if (NODE_ENV === 'development') {
    console.info('-> Ejecución de layout de authenticated.')
  }
  const sessionId = event.cookies.get('token')
  const auth = new Auth(sessionId ?? '')
  await auth.validateAuthAndGetMenuAndOrganizationsToChange(event.url.pathname)
  if (auth.getIsErrorToRedirectLogin()) {
    event.cookies.delete('token', { path: '/' })
    redirect(303, Page.LOGIN)
  }
  if (auth.getIsError()) {
    return { error: auth.error }
  }
  if (auth.getIsErrorToRedirectWelcome()) {
    redirect(303, Page.ADMIN_WELCOME)
  }

  return {
    userFirstName: auth.session.personFirstName,
    menu: auth.menu,
    organizationsToChange: auth.organizationsToChange,
  }
}

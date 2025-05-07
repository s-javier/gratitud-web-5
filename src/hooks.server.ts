import { redirect, type RequestEvent } from '@sveltejs/kit'
import { NODE_ENV } from '$env/static/private'
import { Page } from '~/enums'
import Auth from '~/lib/server/Auth'

export async function handle({ event, resolve }: { event: RequestEvent; resolve: any }) {
  if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
    return new Response(null, { status: 204 })
  }

  if (NODE_ENV === 'development') {
    console.info('->', event.route.id, event.url.pathname)
  }

  if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/gratitud')) {
    const sessionId = event.cookies.get('token')
    const auth = new Auth(sessionId ?? '')
    let pathname = event.url.pathname
    if (pathname === '/admin/organizaciones') {
      pathname = Page.ADMIN_WELCOME
    }
    await auth.validateAuthAndGetMenuAndOrganizationsToChange(pathname)
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
    event.locals = {
      userFirstName: auth.session.personFirstName,
      menu: auth.menu,
      organizationsToChange: auth.organizationsToChange,
      userId: auth.session.personId,
      organizationId: auth.userOrgRole.organizationId,
    }
  }

  return await resolve(event)
}

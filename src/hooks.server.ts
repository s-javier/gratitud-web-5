import { redirect, type RequestEvent } from '@sveltejs/kit'
import { NODE_ENV } from '$env/static/private'
import { Page } from '~/enums'
import Auth from '~/lib/server/Auth'

export async function handle({ event, resolve }: { event: RequestEvent; resolve: any }) {
  if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
    return new Response(null, { status: 204 })
  }

  if (NODE_ENV === 'development') {
    console.info('->', event.request.method, event.route.id, event.url.pathname)
  }

  if ([Page.LOGIN, Page.CODE].includes(event.url.pathname) && event.cookies.get('token')) {
    redirect(303, Page.ADMIN_WELCOME)
  }

  /**
   * Validar autenticación y permisos.
   */
  if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/gratitud')) {
    const sessionId = event.cookies.get('token')
    let pathname = event.url.pathname /* -> Se utiliza para validar permisos */
    /* ▼ Permiso artificial */
    if (
      [Page.ADMIN_ORGANIZATIONS].includes(pathname) ||
      event.url.pathname.startsWith(Page.ADMIN_ROLE) ||
      event.url.pathname.startsWith(Page.ADMIN_PERMISSION) ||
      event.url.pathname.startsWith(Page.ADMIN_USER)
    ) {
      pathname = Page.ADMIN_WELCOME
    }
    /* ▲ Permiso artificial */
    const auth = new Auth({ sessionId, pathname })
    try {
      auth.validateSessionId()
      await auth.getSessionFromMiddleware()
      auth.validateSessionStatus()
      auth.validateSessionExpiration()
      await auth.getUserFromMiddleware()
      auth.validateUserStatusFromMiddleware()
      await auth.getUserOrgRole()
      await auth.getOrganizationsToChange()
      await auth.getMenu()
      await auth.getOrganization()
      await auth.validateOrganizationStatus()
      await auth.getPermissions()
      auth.validatePermission()
    } catch {}
    if (auth.hasErrorToRedirectLogin()) {
      event.cookies.delete('token', { path: '/' })
      redirect(303, Page.LOGIN)
    }
    /* ↓ Sucede cuando el usuario no tiene la organización activa o no tiene permisos,
     *   pero sí está autenticado correctamente. */
    if (auth.hasErrorToRedirectWelcome()) {
      redirect(303, Page.ADMIN_WELCOME)
    }
    event.locals = {
      error: auth.hasError() ? auth.error : null,
      userFirstName: auth.user.firstName,
      menu: auth.menu,
      organizationsToChange: auth.organizationsToChange,
      userId: auth.session.personId,
      organizationId: auth.userOrgRole.organizationId,
      roleId: auth.userOrgRole.roleId,
    }
  }

  return await resolve(event)
}

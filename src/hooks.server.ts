import { redirect, type RequestEvent } from '@sveltejs/kit'
import { AUTH_API, NODE_ENV } from '$env/static/private'
import axios, { AxiosError, type AxiosResponse } from 'axios'

import { Api, Page } from '~/enums'

export async function handle({ event, resolve }: { event: RequestEvent; resolve: any }) {
  if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
    return new Response(null, { status: 204 })
  }

  if (NODE_ENV === 'development') {
    console.info('->', event.request.method, event.route.id, event.url.pathname)
  }

  if ([Page.LOGIN, Page.CODE].includes(event.url.pathname) && event.cookies.get('token')) {
    redirect(303, Page.WELCOME)
  }

  /**
   * Validar autenticación y permisos.
   */
  const path = event.url.pathname
  if (path === '/welcome' || path.startsWith('/gratitud')) {
    const sessionId = event.cookies.get('token')

    let result: AxiosResponse
    try {
      result = await axios.post(`${AUTH_API}${Api.AUTH_VALIDATE_ACCESS}`, {
        sessionId,
        path,
      })
    } catch (error: AxiosError | any) {
      event.cookies.delete('token', { path: '/' })
      redirect(303, Page.LOGIN)
    }

    /* ↓ error: { server?: string; isRedirectToLogin?: boolean } */
    if (result.data.error) {
      if (result.data.error.isRedirectToLogin) {
        event.cookies.delete('token', { path: '/' })
        redirect(303, Page.LOGIN)
      } else if (result.data.error.server) {
        event.locals.error = result.data.error
      }
    } else if (path !== '/welcome' && result.data.isRedirectToWelcome) {
      redirect(303, Page.WELCOME)
    } else {
      event.locals = {
        error: null,
        userId: result.data.userId,
        userFirstName: result.data.userFirstName,
        menuPages: result.data.menuPages,
        organizationsToChange: result.data.organizationsToChange,
        organizationId: result.data.organizationId,
        roleId: result.data.roleId,
      }
    }
  }

  return await resolve(event)
}

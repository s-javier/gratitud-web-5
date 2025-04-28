import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'

export function load(event: RequestEvent) {
  if (event.cookies.get('login') === undefined || event.cookies.get('login') !== 'true') {
    redirect(303, Page.LOGIN)
  }
  event.cookies.delete('login', { path: '/' })
}

import { type RequestEvent } from '@sveltejs/kit'

export async function load(event: RequestEvent) {
  return {
    userFirstName: event.locals.userFirstName,
    menu: event.locals.menu,
    organizationsToChange: event.locals.organizationsToChange,
  }
}

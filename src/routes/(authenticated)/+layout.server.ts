import { type RequestEvent } from '@sveltejs/kit'

export async function load(event: RequestEvent) {
  return {
    userFirstName: event.locals.userFirstName,
    menuPages: event.locals.menuPages,
    organizationsToChange: event.locals.organizationsToChange,
  }
}

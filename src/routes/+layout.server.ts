import { type RequestEvent } from '@sveltejs/kit'

export async function load(event: RequestEvent) {
  return {
    error: event.locals.error,
  }
}

import type { RequestEvent } from '@sveltejs/kit'
import { NODE_ENV } from '$env/static/private'

export async function handle({ event, resolve }: { event: RequestEvent; resolve: any }) {
  if (NODE_ENV === 'development') {
    console.log('->', event.route.id)
  }
  return await resolve(event)
}

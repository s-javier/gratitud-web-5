import type { RequestEvent } from '@sveltejs/kit'
import { NODE_ENV } from '$env/static/private'

export async function handle({ event, resolve }: { event: RequestEvent; resolve: any }) {
  if (event.url.pathname.startsWith('/.well-known/appspecific/com.chrome.devtools')) {
    return new Response(null, { status: 204 })
  }
  if (NODE_ENV === 'development') {
    console.info('->', event.route.id, event.url.pathname)
  }
  return await resolve(event)
}

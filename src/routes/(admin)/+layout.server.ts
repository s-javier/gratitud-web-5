import { redirect } from '@sveltejs/kit'
import { delay } from 'es-toolkit'

export async function load() {
  await delay(5000)
  console.log('Cargar el menú del usuario')
  // redirect(303, `/login?redirectTo=${url.pathname}`)
}

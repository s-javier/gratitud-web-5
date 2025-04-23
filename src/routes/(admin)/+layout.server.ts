import { delay } from 'es-toolkit'

export async function load() {
  await delay(5000)
  console.log('Cargar el menú del usuario')
}

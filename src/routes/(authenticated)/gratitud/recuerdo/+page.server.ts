import { type RequestEvent } from '@sveltejs/kit'

import {
  markTheMemoriesAsRemembered,
  rememberGratitudeByUserId,
  type Gratitude,
} from '~/lib/server/db'

export async function load(event: RequestEvent) {
  let gratitude: Gratitude[]
  try {
    gratitude = await rememberGratitudeByUserId({
      userId: event.locals.userId || '',
      isMaterialized: true,
    })
  } catch (error: any) {
    return { error: JSON.parse(error.message) }
  }
  return { gratitude }
}

export const actions = {
  remember: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const memories = JSON.parse(formData.get('memories')?.toString() || '[]')
    console.log(memories)

    if (memories.length === 0 || memories.length > 3) {
      return {
        error: {
          server: 'Hubo un error, por favor, recarga la página e intentalo de nuevo.',
        },
      }
    }
    try {
      await markTheMemoriesAsRemembered({ memories })
    } catch (err: any) {
      return { error: JSON.parse(err.message) }
    }
    return {
      success: {
        server: 'Agradecimientos recordados con éxito.',
      },
    }
  },
}

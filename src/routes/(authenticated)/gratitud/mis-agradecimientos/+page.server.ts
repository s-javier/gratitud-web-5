import type { RequestEvent } from '@sveltejs/kit'
import { readGratitudeByUserId, type Gratitude } from '~/lib/server/db'

export async function load(event: RequestEvent) {
  let gratitude: Gratitude[]
  try {
    gratitude = await readGratitudeByUserId({ userId: event.locals.userId || '' })
  } catch (error: any) {
    return { error: JSON.parse(error.message) }
  }
  return { gratitude }
}

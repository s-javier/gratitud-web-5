import { v4 as uuidv4 } from 'uuid'

import { sql } from './db'
import { rollbar } from '~/lib/server/rollbar'

type Input = { userId: string; title: string; description: string }

export const createGratitude = async (input: Input) => {
  const title = input.title ? input.title : null
  try {
    await sql`
      INSERT INTO gratitude
        (id, user_id, title, description, created_at)
      VALUES
        (
          ${uuidv4()}, ${input.userId}, ${title}, ${input.description}, ${new Date().toISOString()}
        )
    `
  } catch (e: any) {
    rollbar.error('Error de DB. createGratitude.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
}

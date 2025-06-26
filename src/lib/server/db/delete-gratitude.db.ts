import { sql } from './db'
import { rollbar } from '~/lib/server/rollbar'

export const deleteGratitude = async (input: { gratitudeId: string }) => {
  try {
    await sql`DELETE FROM gratitude WHERE id = ${input.gratitudeId}`
  } catch (e: any) {
    rollbar.error('Error en DB. deleteThankfulness.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
}

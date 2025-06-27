import { sql } from './db'
import { rollbar } from '~/lib/server/rollbar'

export const verifyUserGratitudeUpdate = async (input: { userId: string; gratitudeId: string }) => {
  let query
  try {
    query = await sql`
      SELECT id
      FROM gratitude
      WHERE id = ${input.gratitudeId} AND user_id = ${input.userId}
    `
  } catch (e: any) {
    rollbar.error('Error en DB. verifyUserGratitudeUpdate.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
  if (query.length === 0) {
    throw new Error(JSON.stringify({ isRedirectToWelcome: true }))
  }
}

export const updateGratitude = async (input: {
  gratitudeId: string
  title: string
  description: string
}) => {
  try {
    await sql`
      UPDATE gratitude
      SET title = ${input.title}, description = ${input.description}, updated_at = ${new Date().toISOString()}
      WHERE id = ${input.gratitudeId}
    `
  } catch (e: any) {
    rollbar.error('Error de DB. updateGratitude.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
}

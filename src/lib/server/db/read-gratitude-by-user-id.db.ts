import { sql } from './db'
import { rollbar } from '~/lib/server/rollbar'

export type Gratitude = {
  title?: string
  description: string
}

export const readGratitudeByUserId = async (input: { userId: string }) => {
  let query: any[] = []
  try {
    query = await sql`
      SELECT
        id,
        title,
        description,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at,
        TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS updated_at
      FROM gratitude
      WHERE user_id = ${input.userId} AND is_materialized = true
    `
  } catch (e: any) {
    rollbar.error('Error en DB. readGratitudeByUserId.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
  return query
}

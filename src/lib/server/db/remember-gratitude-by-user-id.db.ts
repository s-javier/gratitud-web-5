import { sql } from './db'
import { rollbar } from '~/lib/server/rollbar'

const remember = async (input: { userId: string; isMaterialized: boolean }) => {
  return await sql`
  SELECT
    id,
    title,
    description,
    TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at,
    TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS updated_at
  FROM gratitude
  WHERE
    user_id = ${input.userId}
    AND is_materialized = ${input.isMaterialized}
    AND remembered_at IS NULL
  ORDER BY RANDOM()
  LIMIT 3
`
}

export const rememberGratitudeByUserId = async (input: {
  userId: string
  isMaterialized: boolean
}) => {
  let query: any[] = []
  try {
    query = await remember(input)
  } catch (e: any) {
    rollbar.error('Error en DB. rememberGratitudeByUserId.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
  if (query.length === 0) {
    /* ↓ Borrón y cuenta nueva de los agradecimientos recordados */
    try {
      await sql`
        UPDATE gratitude
        SET remembered_at = NULL
        WHERE user_id = ${input.userId}`
    } catch (e: any) {
      rollbar.error('Error en DB. rememberGratitudeByUserId en la parte de update.', e)
      throw new Error(
        JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
      )
    }
    try {
      query = await remember(input)
    } catch (e: any) {
      rollbar.error('Error en DB. rememberGratitudeByUserId en el 2° remember.', e)
      throw new Error(
        JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
      )
    }
  }
  return query
}

import sql from './db'
import rollbar from '../rollbar'

export type Gratitude = {
  title?: string
  description: string
}

export const readGratitudeByUserId = async (input: { userId: string }) => {
  let query: any[] = []
  try {
    query = await sql`
      SELECT id, title, description
      FROM gratitude
      WHERE user_id = ${input.userId}
    `
  } catch (e: any) {
    rollbar.error('Error en DB. readGratitudeByUserId.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
  return query
}

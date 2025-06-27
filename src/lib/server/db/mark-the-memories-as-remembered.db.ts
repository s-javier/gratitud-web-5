import { sql } from './db'
import { rollbar } from '~/lib/server/rollbar'

export const markTheMemoriesAsRemembered = async (input: { memories: any[] }) => {
  const memories = input.memories.map((memory: any) => [memory.id])
  try {
    await sql`
      UPDATE gratitude
      SET remembered_at = ${new Date().toISOString()}
      FROM (values ${sql(memories)}) as update_data (id)
      WHERE gratitude.id = (update_data.id)::uuid
    `
  } catch (e: any) {
    rollbar.error('Error de DB. markTheMemoriesAsRemembered.', e)
    throw new Error(
      JSON.stringify({ server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.' }),
    )
  }
}

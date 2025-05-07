import { type RequestEvent, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { Page } from '~/enums'
import db from '~/lib/server/db'
import { sessionTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export const actions = {
  default: async (event: RequestEvent) => {
    try {
      await db
        .update(sessionTable)
        .set({ isActive: false })
        .where(eq(sessionTable.id, event.cookies.get('token')!))
    } catch (e: any) {
      rollbar.error('Error en DB. Logout. Desactivar sesión.', e)
      return {
        error: {
          server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.',
        },
      }
    }
    event.cookies.delete('token', { path: '/' })
    redirect(303, Page.LOGIN)
  },
}

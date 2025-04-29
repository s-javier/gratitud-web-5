import { type RequestEvent, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { NODE_ENV } from '$env/static/private'
import db from '~/lib/server/db'
import { personTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

type Error = {
  server?: string
  email?: string
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxEmail = data.get('email')
    const email: string = typeof auxEmail === 'string' ? auxEmail : ''

    const error: Error = {}

    if (!email) {
      error.email = 'El correo electrónico no puede estar vacío.'
      return { error }
    }

    let user
    try {
      const query = await db
        .select({
          id: personTable.id,
          firstName: personTable.firstName,
          isActive: personTable.isActive,
        })
        .from(personTable)
        .where(eq(personTable.email, email))
      if (query.length === 0) {
        if (NODE_ENV === 'development') {
          console.error('No existe el usuario en la db.')
        }
        event.cookies.set('login', 'true', { path: '/' })
        redirect(303, '/codigo')
      }
      user = query[0]
      console.log('user', user)
    } catch (e: any) {
      rollbar.error('En /ingreso, error al consultar por email en db.', e)
    }
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, '/codigo')
  },
}

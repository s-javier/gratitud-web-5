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

class Machine {
  email: string
  error: Error = {}
  user: any

  constructor(email: string) {
    this.email = email
  }

  validateForm() {
    if (!this.email) {
      this.error.email = 'El correo electrónico no puede estar vacío.'
      throw new Error()
    }
  }

  async getUser() {
    let query
    try {
      query = await db
        .select({
          id: personTable.id,
          firstName: personTable.firstName,
          isActive: personTable.isActive,
        })
        .from(personTable)
        .where(eq(personTable.email, this.email))
    } catch (e: any) {
      rollbar.error('En "/ingreso", error al consultar por email en db.', e)
      this.error.server = 'Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      if (NODE_ENV === 'development') {
        console.error('No existe el usuario en la db.')
      }
      return
    }
    this.user = query[0]
  }
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxEmail = data.get('email')
    const email: string = typeof auxEmail === 'string' ? auxEmail : ''

    const machine = new Machine(email)
    try {
      machine.validateForm()
      await machine.getUser()
    } catch {
      return { error: machine.error }
    }

    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, '/codigo')
  },
}

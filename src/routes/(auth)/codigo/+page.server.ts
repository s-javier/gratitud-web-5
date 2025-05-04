import { redirect, type RequestEvent } from '@sveltejs/kit'
import { and, desc, eq } from 'drizzle-orm'
import * as v from 'valibot'
import { isAfter } from 'date-fns'
import { Page } from '~/enums'
import db from '~/lib/server/db'
import { sessionTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'
import { MAX_ACTIVE_SESSIONS } from '$env/static/private'

export function load(event: RequestEvent) {
  if (event.cookies.get('token')) {
    redirect(303, Page.ADMIN_WELCOME)
  }
  if (event.cookies.get('login') === undefined || event.cookies.get('login') !== 'true') {
    redirect(303, Page.LOGIN)
  }
  event.cookies.delete('login', { path: '/' })
}

class Machine {
  timeLimit: string
  code: string
  error: {
    server?: string
    code?: string
  } = {}
  session: any

  constructor(timeLimit: string, code: string) {
    this.timeLimit = timeLimit
    this.code = code
  }

  getIsError() {
    return Object.keys(this.error).length > 0
  }

  validateForm() {
    const codeErr = v.safeParse(
      v.pipe(
        v.custom(() => {
          return parseInt(this.timeLimit) > 0
        }, 'Código expirado.'),
        v.string('El valor del código es inválido.'),
        v.trim(),
        v.nonEmpty('Digitar el código es obligatorio.'),
        v.regex(/^[0-9]{6}$/, 'El valor del código es inválido.'),
      ),
      this.code,
    )
    if (codeErr.issues) {
      this.error.code = codeErr.issues[0].message
      throw new Error()
    }
  }

  async getSession() {
    let query
    try {
      query = await db
        .select({
          id: sessionTable.id,
          personId: sessionTable.personId,
          codeExpiresAt: sessionTable.codeExpiresAt,
          codeIsActive: sessionTable.codeIsActive,
        })
        .from(sessionTable)
        .where(eq(sessionTable.code, this.code))
        .orderBy(desc(sessionTable.createdAt))
    } catch (e: any) {
      rollbar.error('Error en DB. Ruta "/codigo". Obtención de sesión.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'Por favor, ingresa un código válido.'
      throw new Error()
    }
    this.session = query[0]
  }

  validateCodeIsActive() {
    if (this.session.codeIsActive === false) {
      this.error.server = 'Oh no, hubo un error. Por favor, vuelve a ingresar tu email.'
      throw new Error()
    }
  }

  validateCodeExpiration() {
    if (isAfter(new Date(), this.session.codeExpiresAt)) {
      this.error.server = 'Oh no, el código expiró. Por favor, vuelve a ingresar tu email.'
      throw new Error()
    }
  }

  async disableCodeAndActiveSession() {
    try {
      await db
        .update(sessionTable)
        .set({ isActive: true, codeIsActive: false })
        .where(eq(sessionTable.id, this.session.id))
    } catch (e: any) {
      rollbar.error('Error en DB. Ruta "/codigo". Desactivar código y activar sesión.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async disableMultipleSessions() {
    let sessions
    try {
      sessions = await db
        .select({ id: sessionTable.id })
        .from(sessionTable)
        .where(
          and(
            and(
              // ne(sessionTable.id, this.session.id),
              eq(sessionTable.isActive, true),
            ),
            eq(sessionTable.personId, this.session.personId),
          ),
        )
        .orderBy(desc(sessionTable.createdAt))
    } catch (e: any) {
      rollbar.error('Error en DB. Ruta "/codigo". Obtención de sesiones activas del usuario.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (sessions.length <= parseInt(MAX_ACTIVE_SESSIONS ?? '1')) {
      return
    }
    try {
      await db
        .update(sessionTable)
        .set({ isActive: false })
        .where(eq(sessionTable.id, sessions[parseInt(MAX_ACTIVE_SESSIONS ?? '1')].id))
    } catch (e: any) {
      rollbar.error(
        'Error en DB. Ruta "/codigo". Desactivar la sesión activa número MAX_ACTIVE_SESSIONS + 1.',
        e,
      )
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    console.log(data)
    const auxTimeLimit = data.get('timeLimit')
    const timeLimit: string = typeof auxTimeLimit === 'string' ? auxTimeLimit : '0'
    const auxCode = data.get('otp')
    const code: string = typeof auxCode === 'string' ? auxCode : ''

    const machine = new Machine(timeLimit, code)
    try {
      machine.validateForm()
      await machine.getSession()
      machine.validateCodeIsActive()
      machine.validateCodeExpiration()
      await machine.disableCodeAndActiveSession()
      await machine.disableMultipleSessions()
    } catch {}

    if (machine.getIsError()) {
      return { error: machine.error }
    }
    event.cookies.set('token', machine.session.id, { path: '/' })
    redirect(303, Page.ADMIN_WELCOME)
  },
}

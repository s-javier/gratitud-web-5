import { redirect, type RequestEvent } from '@sveltejs/kit'
import { and, desc, eq } from 'drizzle-orm'
import { isAfter } from 'date-fns'
import { Page } from '~/enums'
import db from '~/lib/server/db'
import { organizationPersonRoleTable, sessionTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

class Machine {
  sessionId: string = ''
  errorToRedirect: {
    server?: string
  } = {}
  error: {
    server?: string
  } = {}
  session: any

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  getIsError() {
    return Object.keys(this.error).length > 0
  }

  validateSessionId() {
    if (!this.sessionId) {
      this.error.server = 'No se encontró la sesión.'
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
        .where(eq(sessionTable.id, this.sessionId))
    } catch (e: any) {
      rollbar.error('Error en DB. Layout Admin. Obtención de sesión.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      rollbar.error('Error en token. Layout Admin. No se encontró sesión por ID.')
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
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

  async getUserOrgRole() {
    let query
    try {
      query = await db
        .select({
          organizationId: organizationPersonRoleTable.organizationId,
          roleId: organizationPersonRoleTable.roleId,
        })
        .from(organizationPersonRoleTable)
        .where(
          and(
            eq(organizationPersonRoleTable.personId, this.session.personId),
            eq(organizationPersonRoleTable.isSelected, true),
          ),
        )
    } catch (e: any) {
      rollbar.error('Error en DB. Layout Admin. Obtención de UserOrgRole.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no está vinculado a una organización.'
      throw new Error()
    }
    userOrgRole = query[0]
  }
}

export async function load(event: RequestEvent) {
  const sessionId = event.cookies.get('token')
  const machine = new Machine(sessionId ?? '')

  try {
    machine.validateSessionId()
    await machine.getSession()
    machine.validateCodeIsActive()
    machine.validateCodeExpiration()
  } catch {}

  if (machine.getIsError()) {
    redirect(303, Page.LOGIN)
  }

  console.log('Cargar el menú del usuario')
}

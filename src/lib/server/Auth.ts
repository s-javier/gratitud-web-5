import * as v from 'valibot'
import { and, asc, desc, eq } from 'drizzle-orm'
import { customAlphabet } from 'nanoid'
import { add, isAfter } from 'date-fns'
import { Resend } from 'resend'
import { MAX_ACTIVE_SESSIONS, NODE_ENV, RESEND_API_KEY, SESSION_DAYS } from '$env/static/private'
import { Page, General } from '~/enums'
import db from '~/lib/server/db'
import {
  menupageTable,
  organizationPersonRoleTable,
  organizationTable,
  permissionTable,
  personTable,
  rolePermissionTable,
  roleTable,
  sessionTable,
} from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class Machine {
  email: string | undefined
  timeLimit: string | undefined
  code: string | undefined
  sessionId: string | undefined
  pathname: string | undefined
  errorToRedirectLogin: {
    server?: string
  } = {}
  error: {
    email?: string
    code?: string
    server?: string
  } = {}
  errorToRedirectWelcome: {
    server?: string
  } = {}
  user: {
    id?: string
    firstName: string
    isActive: boolean
  } = {
    firstName: '',
    isActive: false,
  }
  session: {
    id?: string
    personId: string
    codeExpiresAt?: Date
    codeIsActive?: boolean
    isActive?: boolean
    expiresAt?: Date
  } = {
    personId: '',
  }
  userOrgRole: {
    organizationId: string
    roleId: string
  } = {
    organizationId: '',
    roleId: '',
  }
  organization: {
    isActive: boolean
  } = {
    isActive: false,
  }
  permissions: string[] = []
  menu: any[] = []
  organizationsToChange: any[] = []

  constructor(input: { email: string })
  constructor(input: { timeLimit: string; code: string })
  constructor(input: { sessionId: string | undefined; pathname: string })

  constructor(input: {
    email?: string
    timeLimit?: string
    code?: string
    sessionId?: string
    pathname?: string
  }) {
    this.email = input.email
    this.timeLimit = input.timeLimit
    this.code = input.code
    this.sessionId = input.sessionId
    this.pathname = input.pathname
  }

  hasErrorToRedirectLogin() {
    return Object.keys(this.errorToRedirectLogin).length > 0
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  hasErrorToRedirectWelcome() {
    return Object.keys(this.errorToRedirectWelcome).length > 0
  }

  /**
   * Métodos para formulario de ingreso.
   */

  validateEmail() {
    const emailErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.email('El valor de este campo es inválido.'),
      ),
      this.email,
    )
    if (emailErr.issues) {
      this.error.email = emailErr.issues[0].message
      throw new Error()
    }
  }

  async getUserFromLogin() {
    let query: any
    try {
      query = await db
        .select({
          id: personTable.id,
          firstName: personTable.firstName,
          isActive: personTable.isActive,
        })
        .from(personTable)
        .where(eq(personTable.email, this.email!))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Consulta de usuario.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'Has ingresado un email que no tenemos registrado.'
      throw new Error()
    }
    this.user = query[0]
  }

  validateUserStatusFromLogin() {
    if (this.user.isActive === false) {
      this.error.server = 'Eres un usuario inactivo: no puedes ingresar.'
      throw new Error()
    }
  }

  async createSession() {
    const alphabet = '0123456789'
    this.code = customAlphabet(alphabet, 6)()
    const expiresAt = add(new Date(), { days: Number(SESSION_DAYS) })
    const codeExpiresAt = add(new Date(), { minutes: 5 })
    try {
      await db.insert(sessionTable).values({
        personId: this.user.id!,
        expiresAt,
        code: this.code,
        codeExpiresAt,
        codeIsActive: true,
      })
    } catch (e: any) {
      rollbar.error('Error de DB. Clase Auth. Ruta "/ingreso". Crear sesión.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async sendEmail() {
    // const transporter = createTransport({
    //   host: SMTP_HOST,
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: SMTP_USER,
    //     pass: SMTP_PASS,
    //   },
    //   tls: { rejectUnauthorized: false },
    //   debug: true,
    // })
    // try {
    //   await transporter.sendMail({
    //     from: `"${General.TITLE}" <noresponder@condimento.cl>`,
    //     to: this.email,
    //     subject: 'Ingreso',
    //     html: `
    //       <div style="background-color:rgb(207,208,209);padding-top:30px;padding-bottom:30px">
    //         <div style="padding:30px;font-size:14px;font-family:Lato,Helvetica,Arial,sans-serif;color:rgb(55,65,81);line-height:1.5em;width:98%;max-width:500px;border-radius:16px;margin:10px auto 0;background-color:white">
    //           <p style="margin-bottom: 16px">Hola, ${this.user.firstName}:</p>
    //           <p style="margin-bottom: 16px">Bienvenido/a a ${General.TITLE}. Por favor, utiliza este código para ingresar:</p>
    //           <p style="margin-bottom: 30px; text-align: center;">${this.code}</p>
    //           <p>Que tengas un buen día.</p>
    //         </div>
    //       </div>
    //     `,
    //   })
    // } catch (e: any) {
    //   rollbar.error('Error de envío de email. Ruta "/ingreso".', e)
    //   this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    //   throw new Error()
    // }
    const resend = new Resend(RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: `"${General.TITLE}" <noresponder@condimento.cl>`,
      to: [this.email!],
      subject: 'Ingreso',
      html: `
        <div style="background-color:rgb(207,208,209);padding-top:30px;padding-bottom:30px">
          <div style="padding:30px;font-size:14px;font-family:Lato,Helvetica,Arial,sans-serif;color:rgb(55,65,81);line-height:1.5em;width:98%;max-width:500px;border-radius:16px;margin:10px auto 0;background-color:white">
            <p style="margin-bottom: 16px">Hola, ${this.user.firstName}:</p>
            <p style="margin-bottom: 16px">Bienvenido/a a ${General.TITLE}. Por favor, utiliza este código para ingresar:</p>
            <p style="margin-bottom: 30px; text-align: center;">${this.code}</p>
            <p>Que tengas un buen día.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      rollbar.error('Error de envío de email. Ruta "/ingreso".', error)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }

    if (NODE_ENV === 'development') {
      console.info('Data de email enviado:', data)
    }
  }

  /**
   * Métodos para formulario de código.
   */

  validateTimeLimitAndCode() {
    const codeErr = v.safeParse(
      v.pipe(
        v.custom(() => {
          return parseInt(this.timeLimit!) > 0
        }, 'Código expirado.'),
        v.string('El valor del código es inválido.'),
        v.trim(),
        v.nonEmpty('Digitar el código es obligatorio.'),
        v.regex(/^\d{6}$/, 'El valor del código es inválido.'),
      ),
      this.code,
    )
    if (codeErr.issues) {
      this.error.code = codeErr.issues[0].message
      throw new Error()
    }
  }

  async getSessionFromCode() {
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
        .where(eq(sessionTable.code, this.code!))
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

  validateCodeStatus() {
    if (this.session.codeIsActive === false) {
      this.error.server = 'Oh no, hubo un error. Por favor, vuelve a ingresar tu email.'
      throw new Error()
    }
  }

  validateCodeExpiration() {
    if (isAfter(new Date(), this.session.codeExpiresAt!)) {
      this.error.server = 'Oh no, el código expiró. Por favor, vuelve a ingresar tu email.'
      throw new Error()
    }
  }

  async disableCodeAndActiveSession() {
    try {
      await db
        .update(sessionTable)
        .set({ isActive: true, codeIsActive: false })
        .where(eq(sessionTable.id, this.session.id!))
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

  /**
   * Métodos para middleware.
   */

  validateSessionId() {
    if (!this.sessionId) {
      this.errorToRedirectLogin.server = 'No está la cookie de token.'
      if (NODE_ENV === 'development') {
        console.error('No está la cookie de token.')
      }
      throw new Error()
    }
  }

  async getSessionFromMiddleware() {
    let query
    try {
      query = await db
        .select({
          isActive: sessionTable.isActive,
          personId: sessionTable.personId,
          expiresAt: sessionTable.expiresAt,
        })
        .from(sessionTable)
        .where(eq(sessionTable.id, this.sessionId!))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de sesión.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      rollbar.error('Error en token. Clase Auth. No se encontró sesión por ID.')
      this.errorToRedirectLogin.server = 'El token (sessionId) no está en la base de datos.'
      if (NODE_ENV === 'development') {
        console.error('El token (sessionId) no está en la base de datos.')
      }
      throw new Error()
    }
    this.session = query[0]
  }

  validateSessionStatus() {
    if (this.session.isActive === false) {
      this.errorToRedirectLogin.server = 'La sesión no está activa.'
      if (NODE_ENV === 'development') {
        console.error('La sesión no está activa.')
      }
      throw new Error()
    }
  }

  validateSessionExpiration() {
    if (isAfter(new Date(), this.session.expiresAt!)) {
      this.errorToRedirectLogin.server = 'La sesión expiró.'
      if (NODE_ENV === 'development') {
        console.error('La sesión expiró.')
      }
      throw new Error()
    }
  }

  async getUserFromMiddleware() {
    let query: any
    try {
      query = await db
        .select({
          firstName: personTable.firstName,
          isActive: personTable.isActive,
        })
        .from(personTable)
        .where(eq(personTable.id, this.session.personId))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de usuario.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.errorToRedirectLogin.server = 'El usuario no existe en la DB.'
      throw new Error()
    }
    this.user = query[0]
  }

  validateUserStatusFromMiddleware() {
    if (this.user.isActive === false) {
      this.errorToRedirectLogin.server = 'Eres un usuario inactivo.'
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
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de UserOrgRole.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no está vinculado a una organización.'
      throw new Error()
    }
    this.userOrgRole = query[0]
  }

  async getOrganizationsToChange() {
    let query: any[] = []
    try {
      query = await db
        .select({
          id: organizationTable.id,
          title: organizationTable.title,
          isSelected: organizationPersonRoleTable.isSelected,
        })
        .from(organizationTable)
        .innerJoin(
          organizationPersonRoleTable,
          eq(organizationTable.id, organizationPersonRoleTable.organizationId),
        )
        .where(eq(organizationPersonRoleTable.personId, this.session.personId))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de organizaciones para cambiar.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no está asociado a ninguan organización.'
      throw new Error()
    }
    this.organizationsToChange = query
  }

  async getMenu() {
    let query: any[] = []
    try {
      query = await db
        .select({
          title: menupageTable.title,
          icon: menupageTable.icon,
          path: permissionTable.path,
        })
        .from(menupageTable)
        .innerJoin(permissionTable, eq(menupageTable.permissionId, permissionTable.id))
        .innerJoin(rolePermissionTable, eq(permissionTable.id, rolePermissionTable.permissionId))
        .where(eq(rolePermissionTable.roleId, this.userOrgRole.roleId))
        .orderBy(asc(rolePermissionTable.sort))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de menú.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no tiene menú.'
      throw new Error()
    }
    this.menu = query
  }

  async getOrganization() {
    let query
    try {
      query = await db
        .select({
          isActive: organizationTable.isActive,
        })
        .from(organizationTable)
        .where(eq(organizationTable.id, this.userOrgRole.organizationId))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de organización del usuario.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'No existe la organización del usuario.'
      throw new Error()
    }
    this.organization = query[0]
  }

  validateOrganizationStatus() {
    if (this.organization.isActive === false) {
      this.errorToRedirectWelcome.server = 'La organziación del usuario no está activa.'
      if (NODE_ENV === 'development') {
        console.error('La organziación del usuario no está activa.')
      }
      throw new Error()
    }
  }

  async getPermissions() {
    if (this.pathname === Page.ADMIN_WELCOME) {
      return
    }
    let query: any[] = []
    try {
      query = await db
        .select({ path: permissionTable.path })
        .from(roleTable)
        .innerJoin(rolePermissionTable, eq(roleTable.id, rolePermissionTable.roleId))
        .innerJoin(permissionTable, eq(rolePermissionTable.permissionId, permissionTable.id))
        .where(eq(roleTable.id, this.userOrgRole.roleId))
    } catch (e: any) {
      rollbar.error('Error en DB. Clase Auth. Middleware. Get de permisos.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no tiene permisos.'
      throw new Error()
    }
    this.permissions = query.map((item: any) => item.path)
  }

  validatePermission() {
    if (this.pathname === Page.ADMIN_WELCOME) {
      return
    }
    if (this.permissions.includes(this.pathname!) === false) {
      this.errorToRedirectWelcome.server = 'No tienes permisos para ingresar a esta página.'
      if (NODE_ENV === 'development') {
        console.error('No tienes permisos para ingresar a esta página.')
      }
      throw new Error()
    }
  }
}

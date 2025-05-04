import { type RequestEvent, redirect } from '@sveltejs/kit'
import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import { SESSION_DAYS, SMTP_HOST, SMTP_USER, SMTP_PASS } from '$env/static/private'
import db from '~/lib/server/db'
import { personTable, sessionTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'
import { customAlphabet } from 'nanoid'
import { add } from 'date-fns'
// @ts-ignore
import { createTransport } from 'nodemailer'
import { General, Page } from '~/enums'

export function load(event: RequestEvent) {
  if (event.cookies.get('token')) {
    redirect(303, Page.ADMIN_WELCOME)
  }
}

class Machine {
  email: string
  error: {
    server?: string
    email?: string
  } = {}
  user: any
  code: string = ''

  constructor(email: string) {
    this.email = email
  }

  getIsError() {
    return Object.keys(this.error).length > 0
  }

  validateForm() {
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
      rollbar.error('Error en DB. Ruta "/ingreso". Consulta de email.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      // if (NODE_ENV === 'development') {
      //   console.error('No existe el usuario en la db.')
      // }
      this.error.server = 'Has ingresado un email que no tenemos registrado.'
      throw new Error()
    }
    this.user = query[0]
  }

  validateUserIsActtive() {
    if (this.user.isActive === false) {
      // if (NODE_ENV === 'development') {
      //   console.error('Usuario no activo.')
      // }
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
        personId: this.user.id,
        expiresAt,
        code: this.code,
        codeExpiresAt,
        codeIsActive: true,
      })
    } catch (e: any) {
      rollbar.error('Error de DB. Ruta "/ingreso". Crear sesión.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
  }

  async sendEmail() {
    const transporter = createTransport({
      host: SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
      debug: true,
    })
    try {
      await transporter.sendMail({
        from: `"${General.TITLE}" <noresponder@condimento.cl>`,
        to: this.email,
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
    } catch (e: any) {
      rollbar.error('Error de envío de email. Ruta "/ingreso".', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
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
      machine.validateUserIsActtive()
      await machine.createSession()
      await machine.sendEmail()
    } catch {}

    if (machine.getIsError()) {
      return { error: machine.error }
    }
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, Page.CODE)
  },
}

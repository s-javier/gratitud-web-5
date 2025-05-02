import { type RequestEvent, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { NODE_ENV, SESSION_DAYS } from '$env/static/private'
import db from '~/lib/server/db'
import { personTable, sessionTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'
import { customAlphabet } from 'nanoid'
import { add } from 'date-fns'
// @ts-ignore
import { createTransport } from 'nodemailer'
import { General } from '~/enums'

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
      rollbar.error('Error en DB. Ruta "/ingreso". Consulta de email.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
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

  getUserIsActtive() {
    if (this.user.isActive === false) {
      if (NODE_ENV === 'development') {
        console.error('Usuario no activo.')
      }
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
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
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
      machine.getUserIsActtive()
      await machine.createSession()
      await machine.sendEmail()
    } catch {}

    if (machine.getIsError()) {
      return { error: machine.error }
    }
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, '/codigo')
  },
}

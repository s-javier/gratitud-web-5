import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import db from '~/lib/server/db'
import { personTable } from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'

export default class User {
  userId: string
  firstName: string
  lastName: string
  email: string
  status: boolean
  isConfirmed: boolean
  pathToRedirect: string
  error: {
    userId?: string
    firstName?: string
    lastName?: string
    email?: string
    status?: string
    isConfirmed?: string
    pathToRedirect?: string
    server?: string
  } = {}
  users: any[] = []

  constructor()
  constructor(input: { firstName: string; lastName: string; email: string; status: boolean })
  constructor(input: {
    userId: string
    firstName: string
    lastName: string
    email: string
    status: boolean
  })
  constructor(input: { isConfirmed: boolean; userId: string })

  constructor(
    input: {
      userId?: string
      firstName?: string
      lastName?: string
      email?: string
      status?: boolean
      isConfirmed?: boolean
      pathToRedirect?: string
    } = {},
  ) {
    this.userId = input.userId ?? ''
    this.firstName = input.firstName ?? ''
    this.lastName = input.lastName ?? ''
    this.email = input.email ?? ''
    this.status = input.status ?? false
    this.isConfirmed = input.isConfirmed ?? false
    this.pathToRedirect = input.pathToRedirect ?? ''
  }

  hasError() {
    return Object.keys(this.error).length > 0
  }

  validateId(input: { id: string; key: string }) {
    const idErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.uuid('El valor de este campo es inválido.'),
      ),
      input.id,
    )
    if (idErr.issues) {
      this.error[input.key as keyof typeof this.error] = idErr.issues[0].message
    }
  }

  validateFirstName() {
    const firstNameErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(2, 'Por favor, escribe un poco más.'),
      ),
      this.firstName,
    )
    if (firstNameErr.issues) {
      this.error.firstName = firstNameErr.issues[0].message
    }
  }

  validateLastName() {
    if (this.lastName.length > 0) {
      const lastNameErr = v.safeParse(
        v.pipe(
          v.string('El valor de este campo es inválido.'),
          v.trim(),
          // v.nonEmpty('Este campo es requerido.'),
          v.minLength(2, 'Por favor, escribe un poco más.'),
        ),
        this.lastName,
      )
      if (lastNameErr.issues) {
        this.error.lastName = lastNameErr.issues[0].message
      }
    }
  }

  validateEmail() {
    const emailErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.email('El valor que has ingresado no corresponde a un email válido.'),
      ),
      this.email,
    )
    if (emailErr.issues) {
      this.error.email = emailErr.issues[0].message
    }
  }

  validateIsConfirmed() {
    if (!this.isConfirmed) {
      this.error.isConfirmed = 'Si vas a eliminar, por favor, confirma.'
    }
  }

  validatePathToRedirect() {
    const pathToRedirectErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('Este campo es requerido.'),
        v.minLength(3, 'Por favor, escribe un poco más.'),
      ),
      this.pathToRedirect,
    )
    if (pathToRedirectErr.issues) {
      this.error.pathToRedirect = pathToRedirectErr.issues[0].message
    }
  }

  validateForm() {
    if (Object.keys(this.error).length > 0) {
      throw new Error()
    }
  }

  validateFormToCreate() {
    this.validateFirstName()
    this.validateLastName()
    this.validateEmail()
    this.validateForm()
  }

  validateFormToUpdate() {
    this.validateId({ id: this.userId, key: 'userId' })
    this.validateFirstName()
    this.validateLastName()
    this.validateEmail()
    this.validateForm()
  }

  validateFormToDelete() {
    this.validateId({ id: this.userId, key: 'userId' })
    this.validateIsConfirmed()
    this.validateForm()
  }

  async create() {
    try {
      await db.insert(personTable).values({
        firstName: this.firstName,
        lastName: this.lastName || null,
        email: this.email,
        isActive: this.status,
      })
    } catch (err: any) {
      rollbar.error('Error en DB. Creación de usuario.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async readAll() {
    try {
      this.users = await db
        .select({
          id: personTable.id,
          firstName: personTable.firstName,
          lastName: personTable.lastName,
          email: personTable.email,
          isActive: personTable.isActive,
        })
        .from(personTable)
    } catch (err: any) {
      rollbar.error('Error en DB. Obtener todos los usuarios.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async update() {
    try {
      await db
        .update(personTable)
        .set({
          firstName: this.firstName,
          lastName: this.lastName || null,
          email: this.email,
          isActive: this.status,
        })
        .where(eq(personTable.id, this.userId))
    } catch (err: any) {
      rollbar.error('Error en DB. Actualización de usuario.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }

  async delete() {
    try {
      await db.delete(personTable).where(eq(personTable.id, this.userId))
    } catch (err: any) {
      rollbar.error('Error en DB. Eliminación de usuario.', err)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
    }
  }
}

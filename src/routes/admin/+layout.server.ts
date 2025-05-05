import { redirect, type RequestEvent } from '@sveltejs/kit'
import { and, asc, eq } from 'drizzle-orm'
import { isAfter } from 'date-fns'
import { Page } from '~/enums'
import db from '~/lib/server/db'
import {
  menupageTable,
  organizationPersonRoleTable,
  organizationTable,
  permissionTable,
  rolePermissionTable,
  roleTable,
  sessionTable,
} from '~/lib/server/db/schema'
import rollbar from '~/lib/server/rollbar'
import { NODE_ENV } from '$env/static/private'

class Machine {
  sessionId: string = ''
  errorToRedirectLogin: {
    server?: string
  } = {}
  error: {
    server?: string
  } = {}
  errorToRedirectWelcome: {
    server?: string
  } = {}
  session: {
    isActive: boolean
    personId: string
    expiresAt: Date | null
  } = {
    isActive: false,
    personId: '',
    expiresAt: null,
  }
  userOrgRole: {
    organizationId: string
    roleId: string
  } = {
    organizationId: '',
    roleId: '',
  }
  permissions: string[] = []
  menu: any[] = []
  organizationsToChange: any[] = []

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  getIsErrorToRedirectLogin() {
    return Object.keys(this.errorToRedirectLogin).length > 0
  }

  getIsError() {
    return Object.keys(this.error).length > 0
  }

  getIsErrorToRedirectWelcome() {
    return Object.keys(this.errorToRedirectWelcome).length > 0
  }

  validateSessionId() {
    if (!this.sessionId) {
      this.errorToRedirectLogin.server = 'No está la cookie de token.'
      throw new Error()
    }
  }

  async getSession() {
    let query
    try {
      query = await db
        .select({
          isActive: sessionTable.isActive,
          personId: sessionTable.personId,
          expiresAt: sessionTable.expiresAt,
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
      this.errorToRedirectLogin.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    this.session = query[0]
  }

  validateSessionIsActive() {
    if (this.session.isActive === false) {
      this.errorToRedirectLogin.server =
        'Oh no, hubo un error. Por favor, vuelve a ingresar tu email.'
      throw new Error()
    }
  }

  validateSessionExpiration() {
    if (isAfter(new Date(), this.session.expiresAt!)) {
      this.errorToRedirectLogin.server =
        'Oh no, la sesión expiró. Por favor, vuelve a ingresar tu email.'
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
    this.userOrgRole = query[0]
  }

  async getPermissions(pathname: string) {
    if (pathname === Page.ADMIN_WELCOME) {
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
      rollbar.error('Error en DB. Layout Admin. Obtención de permisos.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no tiene permisos.'
      throw new Error()
    }
    this.permissions = query.map((item: any) => item.path)
  }

  validatePermission(pathname: string) {
    if (pathname === Page.ADMIN_WELCOME) {
      return
    }
    if (this.permissions.includes(pathname) === false) {
      this.errorToRedirectWelcome.server = 'No tienes permisos para ingresar a esta página.'
      throw new Error()
    }
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
      rollbar.error('Error en DB. Layout Admin. Obtención de menú.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no tiene menú.'
      throw new Error()
    }
    this.menu = query
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
      rollbar.error('Error en DB. Layout Admin. Obtención de organizaciones para cambiar.', e)
      this.error.server = 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.'
      throw new Error()
    }
    if (query.length === 0) {
      this.error.server = 'El usuario no está asociado a ninguan organización.'
      throw new Error()
    }
    this.organizationsToChange = query
  }
}

export async function load(event: RequestEvent) {
  const sessionId = event.cookies.get('token')
  const machine = new Machine(sessionId ?? '')

  try {
    machine.validateSessionId()
    await machine.getSession()
    machine.validateSessionIsActive()
    machine.validateSessionExpiration()
    await machine.getUserOrgRole()
    await machine.getPermissions(event.url.pathname)
    machine.validatePermission(event.url.pathname)
    await machine.getMenu()
    await machine.getOrganizationsToChange()
  } catch {}

  if (machine.getIsErrorToRedirectLogin()) {
    if (NODE_ENV === 'development') {
      console.error(machine.errorToRedirectLogin)
    }
    event.cookies.delete('token', { path: '/' })
    redirect(303, Page.LOGIN)
  }

  if (machine.getIsError()) {
    return { error: machine.error }
  }

  if (machine.getIsErrorToRedirectWelcome()) {
    redirect(303, Page.ADMIN_WELCOME)
  }

  return {
    menu: machine.menu,
    organizationsToChange: machine.organizationsToChange,
  }
}

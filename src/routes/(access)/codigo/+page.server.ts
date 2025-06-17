import { redirect, type RequestEvent } from '@sveltejs/kit'
import axios, { AxiosError, type AxiosResponse } from 'axios'
import { Api, Page } from '~/enums'
import { AUTH_API, MAX_ACTIVE_SESSIONS, NODE_ENV, PROJECT_ID } from '$env/static/private'

export function load(event: RequestEvent) {
  if (event.cookies.get('login') === undefined || event.cookies.get('login') !== 'true') {
    redirect(303, Page.LOGIN)
  }
  event.cookies.delete('login', { path: '/' })
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    if (NODE_ENV === 'development') {
      console.info('Formulario de código:', data)
    }
    const auxTimeLimit = data.get('timeLimit')
    const timeLimit: string = typeof auxTimeLimit === 'string' ? auxTimeLimit : '0'
    const auxCode = data.get('otp')
    const code: string = typeof auxCode === 'string' ? auxCode : ''

    let result: AxiosResponse
    try {
      result = await axios.post(`${AUTH_API}${Api.AUTH_SIGN_IN_CODE}`, {
        projectId: PROJECT_ID,
        timeLimit,
        code,
        maxActiveSessions: parseInt(MAX_ACTIVE_SESSIONS),
      })
    } catch (error: AxiosError | any) {
      return {
        error: {
          server: 'Hubo un error. Por favor, inténtalo de nuevo o más tarde.',
        },
      }
    }
    if (result?.data?.error) {
      return {
        error: result.data.error,
      }
    }
    console.log('token', result.data.token)
    event.cookies.set('token', result.data.token, { path: '/' })
    redirect(303, Page.ADMIN_WELCOME)
  },
}

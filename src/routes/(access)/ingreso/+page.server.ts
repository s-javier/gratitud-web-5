import { type RequestEvent, redirect } from '@sveltejs/kit'
import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { Api, General, Page } from '~/enums'
import { API, PROJECT_ID } from '$env/static/private'

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const email = data.get('email')?.toString() || ''

    let result: AxiosResponse
    try {
      result = await axios.post(`${API}${Api.AUTH_SIGN_IN_EMAIL}`, {
        projectId: PROJECT_ID,
        projectTitle: General.TITLE,
        email,
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
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, Page.CODE)
  },
}

import { type RequestEvent, redirect } from '@sveltejs/kit'
import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { Api, General, Page } from '~/enums'
import { AUTH_API, PROJECT_ID, RESEND_API_KEY, SESSION_DAYS } from '$env/static/private'

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const email = data.get('email')?.toString() || ''

    console.log({ email })

    let result: AxiosResponse
    try {
      result = await axios.post(`${AUTH_API}${Api.AUTH_SIGN_IN_EMAIL}`, {
        projectId: PROJECT_ID,
        projectTitle: General.TITLE,
        email,
        sessionDays: parseInt(SESSION_DAYS),
        resendApiKey: RESEND_API_KEY,
        shippingEmail: 'noresponder@condimento.cl',
      })
    } catch (error: AxiosError | any) {
      console.log(error)
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

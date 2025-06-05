import { type RequestEvent, redirect } from '@sveltejs/kit'
import axios, { Axios, type AxiosError, type AxiosResponse } from 'axios'
import { General, Page } from '~/enums'
import Auth from '~/lib/server/Auth'
import { API } from '$env/static/private'

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxEmail = data.get('email')
    const email: string = typeof auxEmail === 'string' ? auxEmail : ''

    let result: AxiosResponse | null = null
    try {
      result = await axios.post(`${API}/auth/login`, { projectTitle: General.TITLE, email })
    } catch (error: AxiosError | any) {
      console.log(error.message)
    }
    console.log('***', result?.data)

    return { error: 'Probando...' }

    // if (auth.hasError()) {
    //   return { error: auth.error }
    // }
    // event.cookies.set('login', 'true', { path: '/' })
    // redirect(303, Page.CODE)
  },
}

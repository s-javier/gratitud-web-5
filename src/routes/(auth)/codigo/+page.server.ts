import { redirect, type RequestEvent } from '@sveltejs/kit'
import { Page } from '~/enums'

export function load(event: RequestEvent) {
  // if (event.cookies.get('login') === undefined || event.cookies.get('login') !== 'true') {
  //   redirect(303, Page.LOGIN)
  // }
  // event.cookies.delete('login', { path: '/' })
}

class Machine {
  code: string
  error: {
    server?: string
    email?: string
  } = {}

  constructor(code: string) {
    this.code = code
  }
}

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const auxCode = data.get('code')
    const code: string = typeof auxCode === 'string' ? auxCode : ''

    const machine = new Machine(code)
    try {
    } catch {}
  },
}

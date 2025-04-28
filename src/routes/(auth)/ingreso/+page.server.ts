import { type RequestEvent, redirect } from '@sveltejs/kit'

export const actions = {
  default: async (event: RequestEvent) => {
    const data = await event.request.formData()
    const error: { email?: string } = {}
    if (!data.get('email')) {
      error.email = 'El correo electrónico no puede estar vacío.'
      return { error }
    }
    event.cookies.set('login', 'true', { path: '/' })
    redirect(303, '/codigo')
  },
}

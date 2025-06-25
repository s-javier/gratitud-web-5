import type { RequestEvent } from '@sveltejs/kit'
import { createGratitude, readGratitudeByUserId, type Gratitude } from '~/lib/server/db'
import { validateText } from '~/lib/validations'

export async function load(event: RequestEvent) {
  let gratitude: Gratitude[]
  try {
    gratitude = await readGratitudeByUserId({ userId: event.locals.userId || '' })
  } catch (error: any) {
    return { error: JSON.parse(error.message) }
  }
  return { gratitude }
}

export const actions = {
  add: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const title = formData.get('title')?.toString() || ''
    const description = formData.get('description')?.toString() || ''

    try {
      validateText({
        label: 'title',
        value: title,
        options: { isPossibleEmpty: true, minLength: 2, maxLength: 50 },
      })
      validateText({
        label: 'description',
        value: description,
        options: { minLength: 5, maxLength: 200 },
      })
      await createGratitude({ userId: event.locals.userId || '', title, description })
    } catch (error: any) {
      return JSON.parse(error.message)
    }
  },
  edit: async (event: RequestEvent) => {},
  delete: async (event: RequestEvent) => {},
}

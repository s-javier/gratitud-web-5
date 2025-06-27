import { redirect, type RequestEvent } from '@sveltejs/kit'

import { Page } from '~/enums/page.enum'
import {
  createGratitude,
  deleteGratitude,
  readGratitudeByUserId,
  updateGratitude,
  verifyUserGratitudeUpdate,
  type Gratitude,
} from '~/lib/server/db'
import { validateBooleanTrue, validateText, validateUUIDV4 } from '~/lib/validations'

export async function load(event: RequestEvent) {
  let gratitude: Gratitude[]
  try {
    gratitude = await readGratitudeByUserId({
      userId: event.locals.userId || '',
      isMaterialized: false,
    })
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
      await createGratitude({
        userId: event.locals.userId || '',
        title,
        description,
        isMaterialized: false,
      })
    } catch (err: any) {
      return { error: JSON.parse(err.message) }
    }
  },
  edit: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const gratitudeId = formData.get('id')?.toString() || ''
    const title = formData.get('title')?.toString() || ''
    const description = formData.get('description')?.toString() || ''

    try {
      validateUUIDV4({ label: 'gratitudeId', value: gratitudeId })
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
      await verifyUserGratitudeUpdate({ userId: event.locals.userId || '', gratitudeId })
      await updateGratitude({ gratitudeId, title, description })
    } catch (err: any) {
      const error = JSON.parse(err.message)
      if (error.isRedirectToWelcome) {
        redirect(303, Page.WELCOME)
      }
      return { error }
    }
  },
  delete: async (event: RequestEvent) => {
    const formData = await event.request.formData()
    const gratitudeId = formData.get('id')?.toString() || ''
    const isConfirmed = formData.get('isConfirmed')?.toString() === 'true' || false

    try {
      validateUUIDV4({ label: 'gratitudeId', value: gratitudeId })
      validateBooleanTrue({ label: 'isConfirmed', value: isConfirmed })
      await deleteGratitude({ gratitudeId: gratitudeId })
    } catch (err: any) {
      return { error: JSON.parse(err.message) }
    }
  },
}

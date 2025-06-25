import Rollbar from 'rollbar'
import { ROLLBAR_TOKEN } from '$env/static/private'

export const rollbar = new Rollbar({
  accessToken: ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
})

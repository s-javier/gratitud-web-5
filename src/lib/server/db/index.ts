import { drizzle } from 'drizzle-orm/node-postgres'
import { DB_URL } from '$env/static/private'

import * as schema from './schema'

export default drizzle({
  connection: DB_URL ?? '',
  // logger: true,
  schema,
})

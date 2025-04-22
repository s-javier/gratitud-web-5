import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

export default drizzle({
  connection: process.env.DB_URL ?? '',
  // logger: true,
  schema,
})

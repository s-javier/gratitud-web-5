import 'dotenv/config'
import db from './index'
import { gratitudeTable } from './schema'

async function test() {
  const gratitudes = await db.select().from(gratitudeTable)
  console.info(gratitudes)
}

test()

import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db'
import { seedData } from './seed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function globalSetup() {
  const seedResult = await seedData()

  const filePath = path.join(__dirname, '.e2e-run-data.json')
  writeFileSync(filePath, JSON.stringify(seedResult, null, 2))

  console.log(
    `[e2e] Seeded run ${seedResult.runId.slice(0, 8)}: user ${seedResult.user.email}`,
  )

  await pool.end()
}

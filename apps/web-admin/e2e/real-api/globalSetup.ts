import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db'
import { seedContentDashboardData, seedData } from './seed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function globalSetup() {
  const seedResult = await seedData()
  const cdSeedResult = await seedContentDashboardData()

  const filePath = path.join(__dirname, '.e2e-run-data.json')
  writeFileSync(
    filePath,
    JSON.stringify({ ...seedResult, cd: cdSeedResult }, null, 2),
  )

  console.log(
    `[e2e] Seeded run: ${seedResult.user.email}, cd: ${cdSeedResult.adminUser.email}`,
  )

  await pool.end()
}

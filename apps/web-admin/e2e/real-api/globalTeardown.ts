import { readFileSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db'
import type { SeedData } from './seed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function globalTeardown() {
  const filePath = path.join(__dirname, '.e2e-run-data.json')

  let seedResult: SeedData
  try {
    seedResult = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    console.warn('[e2e] No seed data file found — skipping teardown')
    return
  }

  console.log(`[e2e] Tearing down run ${seedResult.runId.slice(0, 8)}`)

  const sessionIds = seedResult.liveSessions.map((s) => s.id)
  const topicIds = seedResult.topics.map((t) => t.id)

  await pool.query(
    'DELETE FROM live_session_attendees WHERE session_id = ANY($1)',
    [sessionIds],
  )
  await pool.query('DELETE FROM live_sessions WHERE id = ANY($1)', [sessionIds])
  await pool.query('DELETE FROM assessment_attempts WHERE id = ANY($1)', [
    seedResult.attemptIds,
  ])
  await pool.query('DELETE FROM assessment_questions WHERE quiz_id = ANY($1)', [
    seedResult.quizIds,
  ])
  await pool.query('DELETE FROM assessment_quizzes WHERE id = ANY($1)', [
    seedResult.quizIds,
  ])
  await pool.query('DELETE FROM learning_progress WHERE id = ANY($1)', [
    seedResult.progressIds,
  ])
  await pool.query('DELETE FROM content_topics WHERE id = ANY($1)', [topicIds])
  await pool.query('DELETE FROM content_chapters WHERE id = $1', [
    seedResult.chapter.id,
  ])
  await pool.query('DELETE FROM user_profiles WHERE user_id = $1', [
    seedResult.user.id,
  ])
  await pool.query('DELETE FROM content_subjects WHERE id = $1', [
    seedResult.subject.id,
  ])
  await pool.query('DELETE FROM users WHERE id = $1', [seedResult.user.id])

  try {
    unlinkSync(filePath)
  } catch {}

  await pool.end()
}

import { readFileSync, unlinkSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './db'
import type { ContentDashboardSeedData, SeedData } from './seed'
import { cleanupContentDashboardData } from './seed'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function globalTeardown() {
  const filePath = path.join(__dirname, '.e2e-run-data.json')

  let allData: SeedData & { cd?: ContentDashboardSeedData }
  try {
    allData = JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    console.warn('[e2e] No seed data file found — skipping teardown')
    return
  }

  const seedResult: SeedData = {
    runId: allData.runId,
    user: allData.user,
    subject: allData.subject,
    chapter: allData.chapter,
    topics: allData.topics,
    liveSessions: allData.liveSessions,
    attendeeIds: allData.attendeeIds,
    quizIds: allData.quizIds,
    questionIds: allData.questionIds,
    attemptIds: allData.attemptIds,
    progressIds: allData.progressIds,
  }

  console.log(`[e2e] Tearing down run ${seedResult.runId.slice(0, 8)}`)

  // Clean up content dashboard data first
  if (allData.cd) {
    await cleanupContentDashboardData(allData.cd)
  }

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

import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { pool } from './db'

export interface SeedData {
  runId: string
  user: { id: string; email: string; password: string }
  subject: { id: string }
  chapter: { id: string }
  topics: Array<{ id: string; name: string }>
  liveSessions: Array<{ id: string; status: 'upcoming' | 'live' | 'completed' }>
  attendeeIds: string[]
  quizIds: string[]
  questionIds: string[]
  attemptIds: string[]
  progressIds: string[]
}

export async function seedData(): Promise<SeedData> {
  const runId = randomUUID()
  const now = new Date()

  const userId = '00000000-0000-0000-0000-000000000001'
  const subjectId = '00000000-0000-0000-0000-000000000010'
  const chapterId = '00000000-0000-0000-0000-000000000020'
  const topicIds = [
    {
      id: '00000000-0000-0000-0000-000000000031',
      name: 'E2E Quadratic Equations',
    },
    {
      id: '00000000-0000-0000-0000-000000000032',
      name: 'E2E Linear Inequalities',
    },
    { id: '00000000-0000-0000-0000-000000000033', name: 'E2E Complex Numbers' },
  ]
  const upcomingSessionId = '00000000-0000-0000-0000-000000000041'
  const liveSessionId = '00000000-0000-0000-0000-000000000042'
  const completedSessionId = '00000000-0000-0000-0000-000000000043'
  const attendeeIds = [
    '00000000-0000-0000-0000-000000000051',
    '00000000-0000-0000-0000-000000000052',
    '00000000-0000-0000-0000-000000000053',
  ]
  const quizId = '00000000-0000-0000-0000-000000000061'
  const quiz2Id = '00000000-0000-0000-0000-000000000062'
  const questionIds = [
    '00000000-0000-0000-0000-000000000071',
    '00000000-0000-0000-0000-000000000072',
  ]
  const attemptIds = [
    '00000000-0000-0000-0000-000000000081',
    '00000000-0000-0000-0000-000000000082',
  ]
  const progressIds = [
    '00000000-0000-0000-0000-000000000091',
    '00000000-0000-0000-0000-000000000092',
    '00000000-0000-0000-0000-000000000093',
  ]

  await pool.query(`DELETE FROM learning_progress WHERE id = ANY($1::uuid[])`, [
    progressIds,
  ])
  await pool.query(
    `DELETE FROM assessment_attempts WHERE id = ANY($1::uuid[])`,
    [attemptIds],
  )
  await pool.query(
    `DELETE FROM assessment_questions WHERE id = ANY($1::uuid[])`,
    [questionIds],
  )
  await pool.query(
    `DELETE FROM assessment_quizzes WHERE id = ANY($1::uuid[])`,
    [[quizId, quiz2Id]],
  )
  await pool.query(
    `DELETE FROM live_session_attendees WHERE id = ANY($1::uuid[])`,
    [attendeeIds],
  )
  await pool.query(`DELETE FROM live_sessions WHERE id = ANY($1::uuid[])`, [
    [upcomingSessionId, liveSessionId, completedSessionId],
  ])
  await pool.query(`DELETE FROM content_topics WHERE id = ANY($1::uuid[])`, [
    topicIds.map((t) => t.id),
  ])
  await pool.query(`DELETE FROM content_chapters WHERE id = ANY($1::uuid[])`, [
    [chapterId],
  ])
  await pool.query(`DELETE FROM content_subjects WHERE id = ANY($1::uuid[])`, [
    [subjectId],
  ])
  await pool.query(
    `DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])`,
    [[userId]],
  )
  await pool.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [[userId]])

  const passwordHash = await bcrypt.hash('student123', 4)

  await pool.query(
    `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, 'e2e.student@aspiron.test', passwordHash, true, now, now],
  )

  await pool.query(
    `INSERT INTO user_profiles (user_id, first_name, last_name)
     VALUES ($1, $2, $3)`,
    [userId, 'E2E', 'Student'],
  )

  await pool.query(
    `INSERT INTO content_subjects (id, name, exam_type, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [subjectId, 'E2E Mathematics', 'JEE', now, now],
  )

  await pool.query(
    `INSERT INTO content_chapters (id, name, subject_id, order_number)
     VALUES ($1, $2, $3, $4)`,
    [chapterId, 'E2E Algebra', subjectId, 100],
  )

  for (let i = 0; i < topicIds.length; i++) {
    const t = topicIds[i]
    await pool.query(
      `INSERT INTO content_topics (id, name, chapter_id, order_number)
       VALUES ($1, $2, $3, $4)`,
      [t.id, t.name, chapterId, i + 1],
    )
  }

  const nowPlus1h = new Date(now.getTime() + 60 * 60 * 1000)
  const nowMinus1h = new Date(now.getTime() - 60 * 60 * 1000)
  const nowPlus1d = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  await pool.query(
    `INSERT INTO live_sessions (id, topic_id, scheduled_at, duration_min, provider, join_url)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      upcomingSessionId,
      topicIds[0].id,
      nowPlus1d,
      60,
      'zoom',
      'https://zoom.us/j/e2e-upcoming',
    ],
  )

  await pool.query(
    `INSERT INTO live_sessions (id, topic_id, scheduled_at, duration_min, provider, join_url)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      liveSessionId,
      topicIds[1].id,
      nowPlus1h,
      45,
      'zoom',
      'https://zoom.us/j/e2e-live',
    ],
  )

  await pool.query(
    `INSERT INTO live_sessions (id, topic_id, scheduled_at, duration_min, provider, join_url)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      completedSessionId,
      topicIds[2].id,
      nowMinus1h,
      30,
      'meet',
      'https://meet.google.com/e2e-completed',
    ],
  )

  await pool.query(
    `INSERT INTO live_session_attendees (id, session_id, user_id, joined_at, left_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [attendeeIds[0], liveSessionId, userId, nowMinus1h, null],
  )

  await pool.query(
    `INSERT INTO live_session_attendees (id, session_id, user_id, joined_at, left_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [attendeeIds[1], completedSessionId, userId, nowMinus1h, now],
  )

  await pool.query(
    `INSERT INTO assessment_quizzes (id, topic_id, title)
     VALUES ($1, $2, $3)`,
    [quizId, topicIds[0].id, 'E2E Quadratic Equations Quiz'],
  )

  await pool.query(
    `INSERT INTO assessment_quizzes (id, topic_id, title)
     VALUES ($1, $2, $3)`,
    [quiz2Id, topicIds[2].id, 'E2E Complex Numbers Quiz'],
  )

  await pool.query(
    `INSERT INTO assessment_questions (id, question, correct_answer, options, quiz_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      questionIds[0],
      'What is 2+2?',
      '4',
      JSON.stringify(['3', '4', '5', '6']),
      quizId,
    ],
  )

  await pool.query(
    `INSERT INTO assessment_questions (id, question, correct_answer, options, quiz_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      questionIds[1],
      'What is the square root of 9?',
      '3',
      JSON.stringify(['2', '3', '4', '9']),
      quizId,
    ],
  )

  await pool.query(
    `INSERT INTO assessment_attempts (id, started_at, submitted_at, quiz_id, user_id, score)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [attemptIds[0], nowMinus1h, now, quizId, userId, 80],
  )

  await pool.query(
    `INSERT INTO assessment_attempts (id, started_at, submitted_at, quiz_id, user_id, score)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [attemptIds[1], nowMinus1h, now, quiz2Id, userId, 40],
  )

  for (let i = 0; i < topicIds.length; i++) {
    await pool.query(
      `INSERT INTO learning_progress (id, topic_id, user_id, progress_percent, last_accessed_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [progressIds[i], topicIds[i].id, userId, [30, 70, 90][i], now],
    )
  }

  return {
    runId,
    user: {
      id: userId,
      email: 'e2e.student@aspiron.test',
      password: 'student123',
    },
    subject: { id: subjectId },
    chapter: { id: chapterId },
    topics: topicIds,
    liveSessions: [
      { id: upcomingSessionId, status: 'upcoming' },
      { id: liveSessionId, status: 'live' },
      { id: completedSessionId, status: 'completed' },
    ],
    attendeeIds,
    quizIds: [quizId, quiz2Id],
    questionIds,
    attemptIds,
    progressIds,
  }
}

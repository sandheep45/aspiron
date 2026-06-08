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

export interface PainPointsSeedData {
  runId: string
  adminUser: { id: string; email: string; password: string }
  emptyAdminUser: { id: string; email: string; password: string }
  studentIds: string[]
  subject: { id: string }
  chapter: { id: string }
  topics: Array<{ id: string; name: string }>
  sessionIds: string[]
  answerIds: string[]
  progressIds: string[]
}

export async function seedPainPointsData(): Promise<PainPointsSeedData> {
  const runId = randomUUID()
  const now = new Date()

  const EMPTY_ADMIN_ID = '20000000-0000-0000-0000-000000000002'
  const ADMIN_ID = '20000000-0000-0000-0000-000000000001'
  const STUDENT_IDS = [
    '20000000-0000-0000-0000-000000000011',
    '20000000-0000-0000-0000-000000000012',
    '20000000-0000-0000-0000-000000000013',
    '20000000-0000-0000-0000-000000000014',
    '20000000-0000-0000-0000-000000000015',
  ]
  const SUBJECT_ID = '20000000-0000-0000-0000-000000000020'
  const CHAPTER_ID = '20000000-0000-0000-0000-000000000030'
  const TOPICS = [
    { id: '20000000-0000-0000-0000-000000000041', name: 'PP Critical Topic' },
    { id: '20000000-0000-0000-0000-000000000042', name: 'PP Medium Topic' },
    { id: '20000000-0000-0000-0000-000000000043', name: 'PP Strong Topic' },
  ]

  // Accuracy targets per topic (practice_accuracy = correct / total * 100):
  //   Topic 0 → 20% (1 correct + 4 wrong per session × 5 students = 5/25)
  //   Topic 1 → 36% (mix per student, total 9/25)
  //   Topic 2 → 80% (4 correct + 1 wrong per session × 5 students = 20/25)
  const CORRECT_PER_SESSION: number[][] = [
    [1, 1, 1, 1, 1], // Topic 0: each student gets 1 correct
    [2, 2, 2, 2, 1], // Topic 1: students 0-3 get 2 correct, student 4 gets 1
    [4, 4, 4, 4, 4], // Topic 2: each student gets 4 correct
  ]
  const ANSWERS_PER_SESSION = 5

  // Clean up existing data for these IDs
  const ALL_TOPIC_IDS = TOPICS.map((t) => t.id)
  const ALL_STUDENT_IDS = [...STUDENT_IDS]

  // Compute session & answer IDs
  const sessionIds: string[] = []
  const answerIds: string[] = []
  const progressIds: string[] = []
  let sessionIdx = 0
  let answerIdx = 0
  let progressIdx = 0

  const SESSION_BASE = '20000000-0000-0000-0000-00000000'
  const ANSWER_BASE = '20000000-0000-0000-0000-00000001'
  const PROGRESS_BASE = '20000000-0000-0000-0000-00000002'

  // Delete in reverse FK order
  for (let t = 0; t < TOPICS.length; t++) {
    for (let s = 0; s < STUDENT_IDS.length; s++) {
      const sid = `${SESSION_BASE}${String(sessionIdx).padStart(4, '0')}`
      sessionIds.push(sid)
      for (let a = 0; a < ANSWERS_PER_SESSION; a++) {
        const aid = `${ANSWER_BASE}${String(answerIdx).padStart(4, '0')}`
        answerIds.push(aid)
        answerIdx++
      }
      sessionIdx++
      const pid = `${PROGRESS_BASE}${String(progressIdx).padStart(4, '0')}`
      progressIds.push(pid)
      progressIdx++
    }
  }

  // Clean up
  await pool.query(
    'DELETE FROM learning_recall_answers WHERE id = ANY($1::uuid[])',
    [answerIds],
  )
  await pool.query(
    'DELETE FROM learning_recall_sessions WHERE id = ANY($1::uuid[])',
    [sessionIds],
  )
  await pool.query('DELETE FROM learning_progress WHERE id = ANY($1::uuid[])', [
    progressIds,
  ])
  await pool.query('DELETE FROM content_topics WHERE id = ANY($1::uuid[])', [
    ALL_TOPIC_IDS,
  ])
  await pool.query('DELETE FROM content_chapters WHERE id = $1', [CHAPTER_ID])
  await pool.query('DELETE FROM content_subjects WHERE id = $1', [SUBJECT_ID])
  await pool.query('DELETE FROM user_roles WHERE user_id = ANY($1::uuid[])', [
    [ADMIN_ID, EMPTY_ADMIN_ID, ...ALL_STUDENT_IDS],
  ])
  await pool.query(
    'DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])',
    [[ADMIN_ID, EMPTY_ADMIN_ID, ...ALL_STUDENT_IDS]],
  )
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [
    [ADMIN_ID, EMPTY_ADMIN_ID, ...ALL_STUDENT_IDS],
  ])

  const passwordHash = await bcrypt.hash('admin123', 4)
  const studentPasswordHash = await bcrypt.hash('student123', 4)

  // Create admin user
  await pool.query(
    `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [ADMIN_ID, 'pp.admin@aspiron.test', passwordHash, true, now, now],
  )
  await pool.query(
    `INSERT INTO user_profiles (user_id, first_name, last_name)
     VALUES ($1, $2, $3)`,
    [ADMIN_ID, 'PainPoints', 'Admin'],
  )

  // Look up ADMIN role (created by Rust seed runner)
  const roleResult = await pool.query(
    `SELECT id FROM roles WHERE name = 'ADMIN'`,
  )
  const roleId: string = roleResult.rows[0]?.id
  if (!roleId) throw new Error('ADMIN role not found — run `just seed` first')

  // Assign ADMIN role to admin user
  await pool.query(
    `INSERT INTO user_roles (id, user_id, role_id, assigned_at, is_active)
     VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), ADMIN_ID, roleId, now, true],
  )

  // Create empty-state admin user (VIEW_ANALYTICS but no content data — for test 4)
  await pool.query(
    `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [EMPTY_ADMIN_ID, 'pp.empty@aspiron.test', passwordHash, true, now, now],
  )
  await pool.query(
    `INSERT INTO user_profiles (user_id, first_name, last_name)
     VALUES ($1, $2, $3)`,
    [EMPTY_ADMIN_ID, 'Empty', 'Admin'],
  )
  await pool.query(
    `INSERT INTO user_roles (id, user_id, role_id, assigned_at, is_active)
     VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), EMPTY_ADMIN_ID, roleId, now, true],
  )

  // Create student users
  for (let i = 0; i < STUDENT_IDS.length; i++) {
    const sid = STUDENT_IDS[i]
    await pool.query(
      `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sid,
        `pp.student${i + 1}@aspiron.test`,
        studentPasswordHash,
        true,
        now,
        now,
      ],
    )
    await pool.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name)
       VALUES ($1, $2, $3)`,
      [sid, `Student`, `${i + 1}`],
    )
  }

  // Create content hierarchy
  await pool.query(
    `INSERT INTO content_subjects (id, name, exam_type, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [SUBJECT_ID, 'PP E2E Mathematics', 'JEE', now, now],
  )
  await pool.query(
    `INSERT INTO content_chapters (id, name, subject_id, order_number)
     VALUES ($1, $2, $3, $4)`,
    [CHAPTER_ID, 'PP E2E Algebra', SUBJECT_ID, 100],
  )
  for (let i = 0; i < TOPICS.length; i++) {
    await pool.query(
      `INSERT INTO content_topics (id, name, chapter_id, order_number)
       VALUES ($1, $2, $3, $4)`,
      [TOPICS[i].id, TOPICS[i].name, CHAPTER_ID, i + 1],
    )
  }

  // Create learning progress + recall sessions + answers
  let sessionCounter = 0
  let answerCounter = 0
  let progressCounter = 0

  for (let t = 0; t < TOPICS.length; t++) {
    for (let s = 0; s < STUDENT_IDS.length; s++) {
      const progressId = `${PROGRESS_BASE}${String(progressCounter).padStart(4, '0')}`
      const sessionId = `${SESSION_BASE}${String(sessionCounter).padStart(4, '0')}`
      const correctCount = CORRECT_PER_SESSION[t][s]

      // Learning progress
      await pool.query(
        `INSERT INTO learning_progress (id, topic_id, user_id, progress_percent, last_accessed_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [progressId, TOPICS[t].id, STUDENT_IDS[s], 50, now],
      )

      // Recall session (completed)
      await pool.query(
        `INSERT INTO learning_recall_sessions (id, user_id, topic_id, status, started_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, STUDENT_IDS[s], TOPICS[t].id, 'completed', now, now],
      )

      // Recall answers
      for (let a = 0; a < ANSWERS_PER_SESSION; a++) {
        const answerId = `${ANSWER_BASE}${String(answerCounter).padStart(4, '0')}`
        const isCorrect = a < correctCount
        await pool.query(
          `INSERT INTO learning_recall_answers (id, session_id, question_type, question, answer, is_correct, score)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            answerId,
            sessionId,
            'mcq',
            `Question ${a + 1} for topic ${t + 1}`,
            isCorrect ? 'Correct answer' : 'Wrong answer',
            isCorrect,
            isCorrect ? 100 : 0,
          ],
        )
        answerCounter++
      }

      sessionCounter++
      progressCounter++
    }
  }

  console.log(
    `[e2e] Seeded pain-points run ${runId.slice(0, 8)}: admin ${ADMIN_ID}, 3 topics, 5 students, ${sessionCounter} sessions, ${answerCounter} answers`,
  )

  return {
    runId,
    adminUser: {
      id: ADMIN_ID,
      email: 'pp.admin@aspiron.test',
      password: 'admin123',
    },
    emptyAdminUser: {
      id: EMPTY_ADMIN_ID,
      email: 'pp.empty@aspiron.test',
      password: 'admin123',
    },
    studentIds: ALL_STUDENT_IDS,
    subject: { id: SUBJECT_ID },
    chapter: { id: CHAPTER_ID },
    topics: TOPICS,
    sessionIds,
    answerIds,
    progressIds,
  }
}

export interface ContentDashboardSeedData {
  runId: string
  adminUser: { id: string; email: string; password: string }
  studentIds: string[]
  subject: { id: string }
  chapter: { id: string }
  topics: Array<{ id: string; name: string }>
  quizIds: string[]
  sessionIds: string[]
  answerIds: string[]
}

export async function seedContentDashboardData(): Promise<ContentDashboardSeedData> {
  const runId = randomUUID()
  const now = new Date()

  const ADMIN_ID = '30000000-0000-0000-0000-000000000001'
  const STUDENT_IDS = [
    '30000000-0000-0000-0000-000000000011',
    '30000000-0000-0000-0000-000000000012',
  ]
  const SUBJECT_ID = '30000000-0000-0000-0000-000000000020'
  const CHAPTER_ID = '30000000-0000-0000-0000-000000000030'
  const CHAPTER_2_ID = '30000000-0000-0000-0000-000000000031'
  const CHAPTER_3_ID = '30000000-0000-0000-0000-000000000032'
  const TOPICS = [
    {
      id: '30000000-0000-0000-0000-000000000041',
      name: 'CD Quadratic Equations',
    },
    { id: '30000000-0000-0000-0000-000000000042', name: 'CD Linear Algebra' },
    { id: '30000000-0000-0000-0000-000000000043', name: 'CD Calculus' },
    {
      id: '30000000-0000-0000-0000-000000000044',
      name: 'CD Trigonometric Functions',
    },
  ]
  const QUIZ_IDS = [
    '30000000-0000-0000-0000-000000000051',
    '30000000-0000-0000-0000-000000000052',
  ]
  const SESSION_BASE = '30000000-0000-0000-0000-00000000'
  const ANSWER_BASE = '30000000-0000-0000-0000-00000001'

  // Compute IDs for cleanup
  const sessionIds: string[] = []
  const answerIds: string[] = []
  let sessionIdx = 0
  let answerIdx = 0
  const ANSWERS_PER_SESSION = 5

  for (let t = 0; t < TOPICS.length; t++) {
    for (let s = 0; s < STUDENT_IDS.length; s++) {
      const sid = `${SESSION_BASE}${String(60 + sessionIdx).padStart(4, '0')}`
      sessionIds.push(sid)
      for (let a = 0; a < ANSWERS_PER_SESSION; a++) {
        const aid = `${ANSWER_BASE}${String(answerIdx).padStart(4, '0')}`
        answerIds.push(aid)
        answerIdx++
      }
      sessionIdx++
    }
  }

  // Clean up
  const ALL_TOPIC_IDS = TOPICS.map((t) => t.id)
  await pool.query(
    'DELETE FROM learning_recall_answers WHERE id = ANY($1::uuid[])',
    [answerIds],
  )
  await pool.query(
    'DELETE FROM learning_recall_sessions WHERE id = ANY($1::uuid[])',
    [sessionIds],
  )
  await pool.query(
    'DELETE FROM assessment_quizzes WHERE id = ANY($1::uuid[])',
    [QUIZ_IDS],
  )
  await pool.query('DELETE FROM content_topics WHERE id = ANY($1::uuid[])', [
    ALL_TOPIC_IDS,
  ])
  await pool.query('DELETE FROM content_chapters WHERE id = ANY($1::uuid[])', [
    [CHAPTER_ID, CHAPTER_2_ID, CHAPTER_3_ID],
  ])
  await pool.query('DELETE FROM content_subjects WHERE id = $1', [SUBJECT_ID])
  await pool.query(
    'DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])',
    [[ADMIN_ID, ...STUDENT_IDS]],
  )
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [
    [ADMIN_ID, ...STUDENT_IDS],
  ])

  const passwordHash = await bcrypt.hash('admin123', 4)
  const studentHash = await bcrypt.hash('student123', 4)

  // Create admin
  await pool.query(
    `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [ADMIN_ID, 'cd.admin@aspiron.test', passwordHash, true, now, now],
  )
  await pool.query(
    `INSERT INTO user_profiles (user_id, first_name, last_name)
     VALUES ($1, $2, $3)`,
    [ADMIN_ID, 'Content', 'Admin'],
  )

  // Create students
  for (let i = 0; i < STUDENT_IDS.length; i++) {
    await pool.query(
      `INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        STUDENT_IDS[i],
        `cd.student${i + 1}@aspiron.test`,
        studentHash,
        true,
        now,
        now,
      ],
    )
    await pool.query(
      `INSERT INTO user_profiles (user_id, first_name, last_name)
       VALUES ($1, $2, $3)`,
      [STUDENT_IDS[i], 'Student', `${i + 1}`],
    )
  }

  // Content hierarchy
  await pool.query(
    `INSERT INTO content_subjects (id, name, exam_type, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [SUBJECT_ID, 'CD Mathematics', 'JEE', now, now],
  )
  await pool.query(
    `INSERT INTO content_chapters (id, name, subject_id, order_number)
     VALUES ($1, $2, $3, $4)`,
    [CHAPTER_ID, 'CD Algebra', SUBJECT_ID, 100],
  )
  await pool.query(
    `INSERT INTO content_chapters (id, name, subject_id, order_number)
     VALUES ($1, $2, $3, $4)`,
    [CHAPTER_2_ID, 'CD Geometry', SUBJECT_ID, 200],
  )
  await pool.query(
    `INSERT INTO content_chapters (id, name, subject_id, order_number)
     VALUES ($1, $2, $3, $4)`,
    [CHAPTER_3_ID, 'CD Trigonometry', SUBJECT_ID, 300],
  )
  for (let i = 0; i < TOPICS.length; i++) {
    const chapterId = i < 3 ? CHAPTER_ID : CHAPTER_3_ID
    await pool.query(
      `INSERT INTO content_topics (id, name, chapter_id, order_number)
       VALUES ($1, $2, $3, $4)`,
      [TOPICS[i].id, TOPICS[i].name, chapterId, i + 1],
    )

    // Create a quiz for each topic with questions
    if (i < 2) {
      await pool.query(
        `INSERT INTO assessment_quizzes (id, topic_id, title)
         VALUES ($1, $2, $3)`,
        [QUIZ_IDS[i], TOPICS[i].id, `${TOPICS[i].name} Quiz`],
      )
    }
  }

  // Recall sessions + answers
  const correctPerSession = [3, 2] // first student 3/5, second 2/5
  sessionIdx = 0
  answerIdx = 0

  for (let t = 0; t < TOPICS.length; t++) {
    for (let s = 0; s < STUDENT_IDS.length; s++) {
      const sessionId = `${SESSION_BASE}${String(60 + sessionIdx).padStart(4, '0')}`
      await pool.query(
        `INSERT INTO learning_recall_sessions (id, user_id, topic_id, status, started_at, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, STUDENT_IDS[s], TOPICS[t].id, 'completed', now, now],
      )
      for (let a = 0; a < ANSWERS_PER_SESSION; a++) {
        const answerId = `${ANSWER_BASE}${String(answerIdx).padStart(4, '0')}`
        const isCorrect = a < correctPerSession[s]
        await pool.query(
          `INSERT INTO learning_recall_answers (id, session_id, question_type, question, answer, is_correct, score)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            answerId,
            sessionId,
            'mcq',
            `Q${a + 1}`,
            isCorrect ? 'Correct' : 'Wrong',
            isCorrect,
            isCorrect ? 100 : 0,
          ],
        )
        answerIdx++
      }
      sessionIdx++
    }
  }

  console.log(
    `[e2e] Seeded content dashboard run ${runId.slice(0, 8)}: 1 subject, 3 topics, 2 quizzes, ${sessionIdx} sessions, ${answerIdx} answers`,
  )

  return {
    runId,
    adminUser: {
      id: ADMIN_ID,
      email: 'cd.admin@aspiron.test',
      password: 'admin123',
    },
    studentIds: STUDENT_IDS,
    subject: { id: SUBJECT_ID },
    chapter: { id: CHAPTER_ID },
    topics: TOPICS,
    quizIds: QUIZ_IDS,
    sessionIds,
    answerIds,
  }
}

export async function cleanupContentDashboardData(
  data: ContentDashboardSeedData,
) {
  const allUserIds = [data.adminUser.id, ...data.studentIds]
  const allTopicIds = data.topics.map((t) => t.id)

  await pool.query(
    'DELETE FROM learning_recall_answers WHERE id = ANY($1::uuid[])',
    [data.answerIds],
  )
  await pool.query(
    'DELETE FROM learning_recall_sessions WHERE id = ANY($1::uuid[])',
    [data.sessionIds],
  )
  await pool.query(
    'DELETE FROM assessment_quizzes WHERE id = ANY($1::uuid[])',
    [data.quizIds],
  )
  await pool.query('DELETE FROM content_topics WHERE id = ANY($1::uuid[])', [
    allTopicIds,
  ])
  await pool.query('DELETE FROM content_chapters WHERE id = $1', [
    data.chapter.id,
  ])
  await pool.query('DELETE FROM content_subjects WHERE id = $1', [
    data.subject.id,
  ])
  await pool.query(
    'DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])',
    [allUserIds],
  )
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [allUserIds])

  console.log(
    `[e2e] Cleaned up content dashboard run ${data.runId.slice(0, 8)}`,
  )
}

export async function cleanupPainPointsData(data: PainPointsSeedData) {
  const allUserIds = [
    data.adminUser.id,
    data.emptyAdminUser.id,
    ...data.studentIds,
  ]
  const allTopicIds = data.topics.map((t) => t.id)

  await pool.query(
    'DELETE FROM learning_recall_answers WHERE id = ANY($1::uuid[])',
    [data.answerIds],
  )
  await pool.query(
    'DELETE FROM learning_recall_sessions WHERE id = ANY($1::uuid[])',
    [data.sessionIds],
  )
  await pool.query('DELETE FROM learning_progress WHERE id = ANY($1::uuid[])', [
    data.progressIds,
  ])
  await pool.query('DELETE FROM content_topics WHERE id = ANY($1::uuid[])', [
    allTopicIds,
  ])
  await pool.query('DELETE FROM content_chapters WHERE id = $1', [
    data.chapter.id,
  ])
  await pool.query('DELETE FROM content_subjects WHERE id = $1', [
    data.subject.id,
  ])
  await pool.query('DELETE FROM user_roles WHERE user_id = ANY($1::uuid[])', [
    allUserIds,
  ])
  await pool.query(
    'DELETE FROM user_profiles WHERE user_id = ANY($1::uuid[])',
    [allUserIds],
  )
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [allUserIds])

  console.log(`[e2e] Cleaned up pain-points run ${data.runId.slice(0, 8)}`)
}

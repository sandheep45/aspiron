import type {
  AttemptResponse,
  AttemptResultResponse,
  QuestionResponse,
  QuizResponse,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildQuizResponse = (
  overrides?: Partial<QuizResponse>,
): QuizResponse => ({
  id: nextId('quiz'),
  title: 'Test Quiz',
  description: 'A test quiz description',
  time_limit_minutes: 30,
  passing_score: 70,
  ...overrides,
})

export const buildQuizResponseList = (
  count: number,
  overrides?: Partial<QuizResponse>,
): QuizResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildQuizResponse({
      id: `quiz-${i + 1}`,
      title: `Quiz ${i + 1}`,
      ...overrides,
    }),
  )

export const buildQuestionResponse = (
  overrides?: Partial<QuestionResponse>,
): QuestionResponse => ({
  id: nextId('question'),
  quiz_id: nextId('quiz'),
  question_text: 'What is the capital of France?',
  question_type: 'multiple_choice',
  ...overrides,
})

export const buildQuestionResponseList = (
  count: number,
  overrides?: Partial<QuestionResponse>,
): QuestionResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildQuestionResponse({
      id: `question-${i + 1}`,
      question_text: `Question ${i + 1}`,
      ...overrides,
    }),
  )

export const buildAttemptResponse = (
  overrides?: Partial<AttemptResponse>,
): AttemptResponse => ({
  id: nextId('attempt'),
  user_id: nextId('user'),
  quiz_id: nextId('quiz'),
  status: 'in_progress',
  ...overrides,
})

export const buildAttemptResultResponse = (
  overrides?: Partial<AttemptResultResponse>,
): AttemptResultResponse => ({
  attempt_id: nextId('attempt'),
  total_questions: 10,
  correct_answers: 7,
  score_percent: 70,
  passed: true,
  ...overrides,
})

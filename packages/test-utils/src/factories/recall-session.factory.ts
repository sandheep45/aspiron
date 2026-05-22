import type {
  RecallQuestionResponse,
  RecallResultResponse,
  RecallSessionResponse,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildRecallSessionResponse = (
  overrides?: Partial<RecallSessionResponse>,
): RecallSessionResponse => ({
  id: nextId('recall-session'),
  user_id: nextId('user'),
  topic_id: nextId('topic'),
  status: 'in_progress',
  ...overrides,
})

export const buildRecallSessionResponseList = (
  count: number,
  overrides?: Partial<RecallSessionResponse>,
): RecallSessionResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildRecallSessionResponse({
      id: `recall-session-${i + 1}`,
      ...overrides,
    }),
  )

export const buildRecallQuestionResponse = (
  overrides?: Partial<RecallQuestionResponse>,
): RecallQuestionResponse => ({
  id: nextId('recall-question'),
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correct_answer: 1,
  ...overrides,
})

export const buildRecallQuestionResponseList = (
  count: number,
  overrides?: Partial<RecallQuestionResponse>,
): RecallQuestionResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildRecallQuestionResponse({
      id: `recall-question-${i + 1}`,
      ...overrides,
    }),
  )

export const buildRecallResultResponse = (
  overrides?: Partial<RecallResultResponse>,
): RecallResultResponse => ({
  session_id: nextId('recall-session'),
  total_questions: 10,
  correct_answers: 8,
  score_percent: 80,
  ...overrides,
})

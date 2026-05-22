import type {
  AttemptResponse,
  AttemptResultResponse,
  QuestionResponse,
  QuizResponse,
} from '@aspiron/api-client'
import {
  buildAttemptResponse,
  buildAttemptResultResponse,
  buildQuestionResponse,
  buildQuizResponse,
} from '@aspiron/test-utils/factories'

export function createQuizResponse(
  overrides?: Partial<QuizResponse>,
): QuizResponse {
  return buildQuizResponse(overrides)
}

export function createQuestionResponse(
  overrides?: Partial<QuestionResponse>,
): QuestionResponse {
  return buildQuestionResponse(overrides)
}

export function createAttemptResponse(
  overrides?: Partial<AttemptResponse>,
): AttemptResponse {
  return buildAttemptResponse(overrides)
}

export function createAttemptResultResponse(
  overrides?: Partial<AttemptResultResponse>,
): AttemptResultResponse {
  return buildAttemptResultResponse(overrides)
}

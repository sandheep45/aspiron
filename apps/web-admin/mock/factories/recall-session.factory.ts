import type {
  RecallQuestionResponse,
  RecallResultResponse,
  RecallSessionResponse,
} from '@aspiron/api-client'
import {
  buildRecallQuestionResponse,
  buildRecallResultResponse,
  buildRecallSessionResponse,
} from '@aspiron/test-utils/factories'

export function createRecallSessionResponse(
  overrides?: Partial<RecallSessionResponse>,
): RecallSessionResponse {
  return buildRecallSessionResponse(overrides)
}

export function createRecallQuestionResponse(
  overrides?: Partial<RecallQuestionResponse>,
): RecallQuestionResponse {
  return buildRecallQuestionResponse(overrides)
}

export function createRecallResultResponse(
  overrides?: Partial<RecallResultResponse>,
): RecallResultResponse {
  return buildRecallResultResponse(overrides)
}

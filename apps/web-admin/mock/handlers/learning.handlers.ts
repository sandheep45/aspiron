import { buildProgressResponse } from '@aspiron/test-utils/factories'
import {
  createRecallQuestionResponse,
  createRecallResultResponse,
  createRecallSessionResponse,
} from '@mock/factories/recall-session.factory'
import { HttpResponse, http } from 'msw'

export const learningHandlers = [
  http.post('*/api/v1/recall/start', () => {
    return HttpResponse.json(
      createRecallSessionResponse({ status: 'in_progress' }),
      { status: 201 },
    )
  }),

  http.get('*/api/v1/recall/:sessionId/mcqs', ({ params }) => {
    const sessionId = params.sessionId as string
    return HttpResponse.json({
      session_id: sessionId,
      questions: [
        createRecallQuestionResponse({ id: 'q-1' }),
        createRecallQuestionResponse({
          id: 'q-2',
          question: 'What is the capital of Japan?',
          correct_answer: 2,
        }),
        createRecallQuestionResponse({
          id: 'q-3',
          question: 'What is H2O?',
          correct_answer: 0,
        }),
      ],
    })
  }),

  http.post('*/api/v1/recall/:sessionId/mcqs/submit', ({ params }) => {
    const sessionId = params.sessionId as string
    return HttpResponse.json(
      createRecallResultResponse({ session_id: sessionId }),
    )
  }),

  http.get('*/api/v1/recall/:sessionId/result', ({ params }) => {
    const sessionId = params.sessionId as string
    return HttpResponse.json(
      createRecallResultResponse({ session_id: sessionId }),
    )
  }),

  http.post('*/api/v1/progress/update', () => {
    return HttpResponse.json(buildProgressResponse())
  }),

  http.get('*/api/v1/progress/summary', () => {
    return HttpResponse.json({
      topics_completed: 12,
      topics_in_progress: 3,
      overall_percent: 65,
    })
  }),
]

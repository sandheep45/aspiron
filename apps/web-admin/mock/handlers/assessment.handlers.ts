import {
  buildAttemptResponse,
  buildAttemptResultResponse,
  buildQuestionResponseList,
  buildQuizResponse,
} from '@aspiron/test-utils/factories'
import { HttpResponse, http } from 'msw'

export const assessmentHandlers = [
  http.get('*/api/v1/topics/:topicId/quizzes', ({ params }) => {
    const topicId = params.topicId as string
    return HttpResponse.json([
      buildQuizResponse({ id: 'quiz-1', title: `Quiz for ${topicId}` }),
    ])
  }),

  http.get('*/api/v1/quizzes/:quizId', ({ params }) => {
    const quizId = params.quizId as string
    return HttpResponse.json(buildQuizResponse({ id: quizId }))
  }),

  http.get('*/api/v1/quizzes/:quizId/questions', ({ params }) => {
    const quizId = params.quizId as string
    return HttpResponse.json(buildQuestionResponseList(5, { quiz_id: quizId }))
  }),

  http.post('*/api/v1/attempts', () => {
    return HttpResponse.json(buildAttemptResponse({ status: 'in_progress' }), {
      status: 201,
    })
  }),

  http.post('*/api/v1/attempts/:attemptId/submit', ({ params }) => {
    const attemptId = params.attemptId as string
    return HttpResponse.json(
      buildAttemptResultResponse({ attempt_id: attemptId }),
    )
  }),

  http.get('*/api/v1/attempts/:attemptId/results', ({ params }) => {
    const attemptId = params.attemptId as string
    return HttpResponse.json(
      buildAttemptResultResponse({ attempt_id: attemptId }),
    )
  }),
]

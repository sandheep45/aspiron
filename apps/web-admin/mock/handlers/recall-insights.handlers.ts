import {
  buildFreeRecallResponse,
  buildMcqRecallResponse,
  buildMemoryGapMapResponse,
  buildRecallOverview,
  buildRecallTrendsResponse,
  buildSuggestedActionsResponse,
} from '@mock/factories/recall-insights.factory'
import { HttpResponse, http } from 'msw'

export const recallInsightsHandlers = [
  http.get('*/api/v1/topics/:topicId/recall/overview', ({ params }) => {
    if (params.topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildRecallOverview())
  }),

  http.get('*/api/v1/topics/:topicId/recall/mcq', ({ params }) => {
    if (params.topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildMcqRecallResponse())
  }),

  http.get('*/api/v1/topics/:topicId/recall/free-response', ({ params }) => {
    if (params.topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildFreeRecallResponse())
  }),

  http.get('*/api/v1/topics/:topicId/recall/gaps', ({ params }) => {
    if (params.topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildMemoryGapMapResponse())
  }),

  http.get('*/api/v1/topics/:topicId/recall/actions', ({ params }) => {
    if (params.topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildSuggestedActionsResponse())
  }),

  http.get('*/api/v1/topics/:topicId/recall/trends', ({ params }) => {
    if (params.topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildRecallTrendsResponse())
  }),
]

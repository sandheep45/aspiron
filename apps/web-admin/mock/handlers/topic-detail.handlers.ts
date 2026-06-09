import { HttpResponse, http } from 'msw'
import {
  buildTopicActionsResponse,
  buildTopicComponentsResponse,
  buildTopicIssuesResponse,
  buildTopicOverview,
  buildTopicTrendsResponse,
} from '../factories/topic-detail.factory'

export const topicDetailHandlers = [
  http.get('*/api/v1/topics/:topicId/overview', ({ params }) => {
    const { topicId } = params
    if (topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildTopicOverview())
  }),

  http.get('*/api/v1/topics/:topicId/issues', ({ params }) => {
    const { topicId } = params
    if (topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildTopicIssuesResponse())
  }),

  http.get('*/api/v1/topics/:topicId/components', ({ params }) => {
    const { topicId } = params
    if (topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildTopicComponentsResponse())
  }),

  http.get('*/api/v1/topics/:topicId/actions', ({ params }) => {
    const { topicId } = params
    if (topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildTopicActionsResponse())
  }),

  http.get('*/api/v1/topics/:topicId/trends', ({ params }) => {
    const { topicId } = params
    if (topicId === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json(buildTopicTrendsResponse())
  }),
]

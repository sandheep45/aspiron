import type {
  CriticalIssuesResponse,
  PainPointsResponse,
  PatternInsightsResponse,
  TopicDetailResponse,
} from '@aspiron/api-client'
import { HttpResponse, http } from 'msw'
import {
  buildCriticalIssuesResponse,
  buildPainPointsResponse,
  buildPatternInsightsResponse,
  buildTopicDetailResponse,
} from '../factories/pain-points.factory'

export const painPointsHandlers = [
  http.get('*/api/v1/admin/insights/pain-points/critical', () => {
    const response: CriticalIssuesResponse = buildCriticalIssuesResponse(3)
    return HttpResponse.json(response)
  }),

  http.get('*/api/v1/admin/insights/pain-points', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const search = url.searchParams.get('search')
    const severity = url.searchParams.get('severity')
    const status = url.searchParams.get('status')

    const response: PainPointsResponse = buildPainPointsResponse(25)

    let filtered = response.items
    if (search) {
      const lower = search.toLowerCase()
      filtered = filtered.filter((item) =>
        item.topic.toLowerCase().includes(lower),
      )
    }
    if (severity) {
      filtered = filtered.filter((item) => item.recall_strength === severity)
    }
    if (status) {
      filtered = filtered.filter((item) => item.status === status)
    }

    const start = (page - 1) * limit
    const paged = filtered.slice(start, start + limit)

    return HttpResponse.json({
      total: filtered.length as unknown as bigint,
      items: paged,
    })
  }),

  http.get('*/api/v1/admin/insights/pain-points/insights', () => {
    const response: PatternInsightsResponse = buildPatternInsightsResponse()
    return HttpResponse.json(response)
  }),

  http.get('*/api/v1/admin/insights/pain-points/:id', ({ params }) => {
    const { id } = params
    if (id === 'unknown') {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Topic not found' } },
        { status: 404 },
      )
    }
    const response: TopicDetailResponse = buildTopicDetailResponse({
      topic: `Topic ${id}`,
    })
    return HttpResponse.json(response)
  }),
]

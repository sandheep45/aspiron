import { HttpResponse, http } from 'msw'
import {
  buildContentDashboardAttentionResponse,
  buildContentDashboardSignalsResponse,
  buildContentDashboardSubjectsResponse,
  buildContentDashboardSummary,
} from '../factories/content-dashboard.factory'

export const contentDashboardHandlers = [
  http.get('*/api/v1/content/dashboard/summary', () => {
    const response = buildContentDashboardSummary()
    return HttpResponse.json(response)
  }),

  http.get('*/api/v1/content/dashboard/attention', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const issue = url.searchParams.get('issue')
    const sortBy = url.searchParams.get('sort_by')
    const sortOrder = url.searchParams.get('sort_order') || 'asc'
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10

    const fullResponse = buildContentDashboardAttentionResponse(12)
    let items = fullResponse.items

    if (search) {
      items = items.filter((item) => item.topic.toLowerCase().includes(search))
    }

    if (issue) {
      items = items.filter(
        (item) => item.issue.toLowerCase() === issue.toLowerCase(),
      )
    }

    if (sortBy === 'topic') {
      items.sort((a, b) =>
        sortOrder === 'desc'
          ? b.topic.localeCompare(a.topic)
          : a.topic.localeCompare(b.topic),
      )
    } else if (sortBy === 'students') {
      items.sort((a, b) =>
        sortOrder === 'desc'
          ? Number(b.students_affected) - Number(a.students_affected)
          : Number(a.students_affected) - Number(b.students_affected),
      )
    }

    const total = items.length
    const start = (page - 1) * limit
    const paginatedItems = items.slice(start, start + limit)

    return HttpResponse.json({
      total,
      items: paginatedItems,
    })
  }),

  http.get('*/api/v1/content/dashboard/subjects', () => {
    const response = buildContentDashboardSubjectsResponse(3)
    return HttpResponse.json(response)
  }),

  http.get('*/api/v1/content/dashboard/signals', () => {
    const response = buildContentDashboardSignalsResponse()
    return HttpResponse.json(response)
  }),
]

import { HttpResponse, http } from 'msw'
import {
  buildInsightItemList,
  buildTopicItemList,
  buildTopicSummary,
  resetIdCounter,
} from '../factories/topics-page.factory'

interface TopicsQueryString {
  search?: string
  sort_by?: string
  sort_order?: string
  status_filter?: string
  content_status_filter?: string
  recall_filter?: string
  video_filter?: string
  page?: string
  limit?: string
}

export const topicsPageHandlers = [
  http.get('*/api/v1/chapters/:chapterId/topics-page/summary', ({ params }) => {
    const chapterId = params.chapterId as string
    return HttpResponse.json(
      buildTopicSummary({ chapter_name: `Chapter ${chapterId}` }),
    )
  }),

  http.get('*/api/v1/chapters/:chapterId/topics-page/topics', ({ request }) => {
    const url = new URL(request.url)
    const q = Object.fromEntries(
      url.searchParams.entries(),
    ) as TopicsQueryString

    resetIdCounter()
    let items = buildTopicItemList(15)

    if (q.search) {
      const lower = q.search.toLowerCase()
      items = items.filter((t) => t.name.toLowerCase().includes(lower))
    }

    if (q.status_filter) {
      items = items.filter((t) => t.status === q.status_filter)
    }

    if (q.content_status_filter) {
      items = items.filter((t) => t.content_status === q.content_status_filter)
    }

    if (q.recall_filter) {
      items = items.filter((t) => t.recall_strength === q.recall_filter)
    }

    if (q.video_filter) {
      const expected = q.video_filter === 'true'
      items = items.filter((t) => t.video_available === expected)
    }

    if (q.sort_by) {
      const isDesc = q.sort_order !== 'asc'
      items.sort((a, b) => {
        let cmp = 0
        switch (q.sort_by) {
          case 'accuracy':
            cmp = a.practice_accuracy - b.practice_accuracy
            break
          case 'recall': {
            const order = { strong: 3, medium: 2, weak: 1 } as Record<
              string,
              number
            >
            cmp =
              (order[a.recall_strength] ?? 0) - (order[b.recall_strength] ?? 0)
            break
          }
          case 'status': {
            const order = {
              healthy: 3,
              needs_attention: 2,
              critical: 1,
            } as Record<string, number>
            cmp = (order[a.status] ?? 0) - (order[b.status] ?? 0)
            break
          }
        }
        return isDesc ? -cmp : cmp
      })
    }

    const page = Math.max(1, Number(q.page) || 1)
    const limit = Math.max(1, Number(q.limit) || 10)
    const start = (page - 1) * limit
    const paginated = items.slice(start, start + limit)

    return HttpResponse.json(paginated)
  }),

  http.get('*/api/v1/chapters/:chapterId/topics-page/insights', () => {
    return HttpResponse.json(buildInsightItemList(3))
  }),
]

import {
  buildChapterItemList,
  buildChapterSummary,
  buildInsightItemList,
} from '@mock/factories/chapters-page.factory'
import { HttpResponse, http } from 'msw'

export const chaptersPageHandlers = [
  http.get(
    '*/api/v1/subjects/:subjectId/chapters-page/summary',
    ({ params }) => {
      const subjectName =
        params.subjectId === 'known-subject-id'
          ? 'Physics'
          : `Subject-${String(params.subjectId).slice(0, 8)}`
      return HttpResponse.json(
        buildChapterSummary({ subject_name: subjectName }),
      )
    },
  ),

  http.get(
    '*/api/v1/subjects/:subjectId/chapters-page/chapters',
    ({ request }) => {
      const url = new URL(request.url)
      const search = url.searchParams.get('search')?.toLowerCase()
      const sortBy = url.searchParams.get('sort_by')
      const sortOrder = url.searchParams.get('sort_order') ?? 'desc'
      const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10)
      const limit = Number.parseInt(url.searchParams.get('limit') ?? '10', 10)

      let chapters = buildChapterItemList(8)

      if (search) {
        chapters = chapters.filter((c) => c.name.toLowerCase().includes(search))
      }

      if (sortBy) {
        const isDesc = sortOrder === 'desc'
        chapters.sort((a, b) => {
          let cmp = 0
          switch (sortBy) {
            case 'coverage':
              cmp = a.coverage - b.coverage
              break
            case 'accuracy':
              cmp = a.practice_accuracy - b.practice_accuracy
              break
            default:
              cmp = 0
          }
          return isDesc ? -cmp : cmp
        })
      }

      const start = (page - 1) * limit
      const paginated = chapters.slice(start, start + limit)

      return HttpResponse.json(paginated)
    },
  ),

  http.get('*/api/v1/subjects/:subjectId/chapters-page/insights', () => {
    return HttpResponse.json(buildInsightItemList(3))
  }),
]

import {
  buildChapterDtoList,
  buildChaptersResponse,
  buildSubjectDtoList,
  buildTopicDto,
  buildTopicsResponse,
} from '@aspiron/test-utils/factories'
import { HttpResponse, http } from 'msw'

export const contentHandlers = [
  http.get('*/api/v1/subjects', () => {
    return HttpResponse.json(buildSubjectDtoList(5))
  }),

  http.get('*/api/v1/subjects/:subjectId/chapters', ({ params }) => {
    const subjectId = params.subjectId as string
    return HttpResponse.json(
      buildChaptersResponse({
        chapters: buildChapterDtoList(3, { subject_id: subjectId }),
      }),
    )
  }),

  http.get('*/api/v1/chapters/:chapterId/topics', ({ params }) => {
    const chapterId = params.chapterId as string
    return HttpResponse.json(
      buildTopicsResponse({
        topics: buildChapterDtoList(3).map((_, i) =>
          buildTopicDto({
            id: `topic-${i + 1}`,
            chapter_id: chapterId,
            name: `Topic ${i + 1}`,
          }),
        ),
      }),
    )
  }),

  http.get('*/api/v1/topics/:topicId', ({ params }) => {
    const topicId = params.topicId as string
    return HttpResponse.json(buildTopicDto({ id: topicId }))
  }),

  http.get('*/api/v1/topics/:topicId/videos', () => {
    return HttpResponse.json([])
  }),
]

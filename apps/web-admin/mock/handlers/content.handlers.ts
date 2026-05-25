import {
  buildChapterDtoList,
  buildChaptersResponse,
  buildOfflineTokenResponse,
  buildPlaybackTokenResponse,
  buildSubjectDtoList,
  buildTopicDto,
  buildTopicsResponse,
  buildVideoDtoList,
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

  http.get('*/api/v1/topics/:topicId/videos', ({ params }) => {
    const topicId = params.topicId as string
    return HttpResponse.json(buildVideoDtoList(3, { topic_id: topicId }))
  }),

  http.get('*/api/v1/videos/:videoId/offline-token', ({ params }) => {
    const videoId = params.videoId as string
    return HttpResponse.json(
      buildOfflineTokenResponse({ offline_token: `offline-${videoId}` }),
    )
  }),

  http.get('*/api/v1/videos/:videoId/playback-token', ({ params }) => {
    const videoId = params.videoId as string
    return HttpResponse.json(
      buildPlaybackTokenResponse({ playback_token: `playback-${videoId}` }),
    )
  }),
]

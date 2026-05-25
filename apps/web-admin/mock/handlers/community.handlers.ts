import {
  buildCommunityPostResponseList,
  buildCommunityThreadResponse,
  buildCommunityThreadResponseList,
} from '@aspiron/test-utils/factories'
import { HttpResponse, http } from 'msw'

export const communityHandlers = [
  http.post('*/api/v1/community/threads', () => {
    return HttpResponse.json(buildCommunityThreadResponse(), { status: 201 })
  }),

  http.get('*/api/v1/community/topics/:topicId/threads', ({ params }) => {
    const topicId = params.topicId as string
    return HttpResponse.json(
      buildCommunityThreadResponseList(3, { topic_id: topicId }),
    )
  }),

  http.get('*/api/v1/community/threads/:threadId', ({ params }) => {
    const threadId = params.threadId as string
    return HttpResponse.json(buildCommunityThreadResponse({ id: threadId }))
  }),

  http.post('*/api/v1/community/threads/:threadId/posts', ({ params }) => {
    const threadId = params.threadId as string
    return HttpResponse.json(
      buildCommunityPostResponseList(2, { thread_id: threadId }),
    )
  }),

  http.post(
    '*/api/v1/community/threads/:threadId/attach-note',
    ({ params }) => {
      const threadId = params.threadId as string
      return HttpResponse.json({
        success: true,
        thread_id: threadId,
        note_id: 'note-1',
      })
    },
  ),

  http.get('*/api/v1/community/threads/public', () => {
    return HttpResponse.json(buildCommunityThreadResponseList(5))
  }),
]

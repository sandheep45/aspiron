import {
  buildLiveClassResponseList,
  buildRecordingResponse,
} from '@aspiron/test-utils/factories'
import { HttpResponse, http } from 'msw'

export const liveSessionHandlers = [
  http.get('*/api/v1/live/classes/upcoming', () => {
    return HttpResponse.json(buildLiveClassResponseList(3))
  }),

  http.post('*/api/v1/live/classes/:classId/join', ({ params }) => {
    const classId = params.classId as string
    return HttpResponse.json({
      success: true,
      class_id: classId,
      join_url: 'https://zoom.us/j/mock',
    })
  }),

  http.get('*/api/v1/live/classes/:classId/recording', ({ params }) => {
    const classId = params.classId as string
    return HttpResponse.json(buildRecordingResponse({ session_id: classId }))
  }),
]

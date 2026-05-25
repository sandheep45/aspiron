import {
  buildNotificationListResponse,
  buildNotificationResponse,
} from '@aspiron/test-utils/factories'
import { HttpResponse, http } from 'msw'

export const notificationHandlers = [
  http.get('*/api/v1/notifications', () => {
    return HttpResponse.json(buildNotificationListResponse())
  }),

  http.patch('*/api/v1/notifications/status', () => {
    return HttpResponse.json(buildNotificationResponse({ status: 'read' }))
  }),
]

import type {
  NotificationListResponse,
  NotificationResponse,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildNotificationResponse = (
  overrides?: Partial<NotificationResponse>,
): NotificationResponse => ({
  id: nextId('notification'),
  user_id: nextId('user'),
  title: 'Test Notification',
  message: 'This is a test notification.',
  status: 'unread',
  ...overrides,
})

export const buildNotificationResponseList = (
  count: number,
  overrides?: Partial<NotificationResponse>,
): NotificationResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildNotificationResponse({
      id: `notification-${i + 1}`,
      title: `Notification ${i + 1}`,
      ...overrides,
    }),
  )

export const buildNotificationListResponse = (
  overrides?: Partial<NotificationListResponse>,
): NotificationListResponse => ({
  notifications: buildNotificationResponseList(5),
  total_count: 5,
  ...overrides,
})

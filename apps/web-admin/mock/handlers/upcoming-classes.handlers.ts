import type { LiveClassResponse } from '@aspiron/api-client'
import { HttpResponse, http } from 'msw'

function addMinutes(date: Date, minutes: number) {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

function buildLiveClassResponse(
  overrides?: Partial<LiveClassResponse>,
): LiveClassResponse {
  return {
    id: 'class-1',
    topic_id: 'topic-1',
    scheduled_at: new Date() as unknown as LiveClassResponse['scheduled_at'],
    duration_min: 45,
    provider: 'Zoom',
    join_url: 'https://zoom.us/j/123',
    ...overrides,
  }
}

export const upcomingClassesHandlers = [
  http.get('*/api/v1/live/classes/upcoming', () => {
    const now = new Date()

    const classes = [
      buildLiveClassResponse({
        id: '1',
        topic_id: 'topic-1',
        scheduled_at: addMinutes(
          now,
          -20,
        ) as unknown as LiveClassResponse['scheduled_at'],
        duration_min: 60,
        provider: 'Quadratic Equations Review',
        join_url: 'https://zoom.us/j/101',
      }),
      buildLiveClassResponse({
        id: '2',
        topic_id: 'topic-2',
        scheduled_at: addMinutes(
          now,
          90,
        ) as unknown as LiveClassResponse['scheduled_at'],
        duration_min: 45,
        provider: 'Photosynthesis Deep Dive',
        join_url: 'https://zoom.us/j/102',
      }),
      buildLiveClassResponse({
        id: '3',
        topic_id: 'topic-3',
        scheduled_at: addMinutes(
          now,
          24 * 60,
        ) as unknown as LiveClassResponse['scheduled_at'],
        duration_min: 30,
        provider: "Newton's Laws Workshop",
        join_url: 'https://zoom.us/j/103',
      }),
    ]

    return HttpResponse.json(classes)
  }),
]

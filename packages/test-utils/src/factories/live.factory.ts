import type { LiveClassResponse, RecordingResponse } from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildLiveClassResponse = (
  overrides?: Partial<LiveClassResponse>,
): LiveClassResponse => ({
  id: nextId('live-class'),
  topic_id: nextId('topic'),
  scheduled_at: new Date(Date.now() + 86400000),
  duration_min: 60,
  provider: 'zoom',
  join_url: 'https://zoom.us/j/test',
  ...overrides,
})

export const buildLiveClassResponseList = (
  count: number,
  overrides?: Partial<LiveClassResponse>,
): LiveClassResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildLiveClassResponse({
      id: `live-class-${i + 1}`,
      ...overrides,
    }),
  )

export const buildRecordingResponse = (
  overrides?: Partial<RecordingResponse>,
): RecordingResponse => ({
  id: nextId('recording'),
  session_id: nextId('live-class'),
  recording_url: 'https://storage.example.com/recordings/test.mp4',
  ...overrides,
})

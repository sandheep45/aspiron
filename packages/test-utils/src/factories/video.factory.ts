import type {
  OfflineTokenResponse,
  PlaybackTokenResponse,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildOfflineTokenResponse = (
  overrides?: Partial<OfflineTokenResponse>,
): OfflineTokenResponse => ({
  offline_token: nextId('offline-token'),
  expires_at: new Date(Date.now() + 86400000),
  ...overrides,
})

export const buildPlaybackTokenResponse = (
  overrides?: Partial<PlaybackTokenResponse>,
): PlaybackTokenResponse => ({
  playback_token: nextId('playback-token'),
  expires_at: new Date(Date.now() + 3600000),
  ...overrides,
})

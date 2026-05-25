import type {
  CommunityPostResponse,
  CommunityThreadResponse,
} from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildCommunityThreadResponse = (
  overrides?: Partial<CommunityThreadResponse>,
): CommunityThreadResponse => ({
  id: nextId('thread'),
  user_id: nextId('user'),
  title: 'Test Thread',
  topic_id: nextId('topic'),
  ...overrides,
})

export const buildCommunityThreadResponseList = (
  count: number,
  overrides?: Partial<CommunityThreadResponse>,
): CommunityThreadResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildCommunityThreadResponse({
      id: `thread-${i + 1}`,
      title: `Thread ${i + 1}`,
      ...overrides,
    }),
  )

export const buildCommunityPostResponse = (
  overrides?: Partial<CommunityPostResponse>,
): CommunityPostResponse => ({
  id: nextId('post'),
  thread_id: nextId('thread'),
  user_id: nextId('user'),
  content: 'This is a test post.',
  ...overrides,
})

export const buildCommunityPostResponseList = (
  count: number,
  overrides?: Partial<CommunityPostResponse>,
): CommunityPostResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildCommunityPostResponse({
      id: `post-${i + 1}`,
      content: `Post ${i + 1} content.`,
      ...overrides,
    }),
  )

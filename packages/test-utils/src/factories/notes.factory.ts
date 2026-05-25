import type { NoteResponse } from '@aspiron/api-client'

let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

export const buildNoteResponse = (
  overrides?: Partial<NoteResponse>,
): NoteResponse => ({
  id: nextId('note'),
  user_id: nextId('user'),
  topic_id: nextId('topic'),
  title: 'Test Note',
  content: 'This is a test note.',
  is_official: false,
  ...overrides,
})

export const buildNoteResponseList = (
  count: number,
  overrides?: Partial<NoteResponse>,
): NoteResponse[] =>
  Array.from({ length: count }, (_, i) =>
    buildNoteResponse({
      id: `note-${i + 1}`,
      title: `Note ${i + 1}`,
      ...overrides,
    }),
  )

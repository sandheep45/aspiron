import {
  buildNoteResponse,
  buildNoteResponseList,
} from '@aspiron/test-utils/factories'
import { HttpResponse, http } from 'msw'

export const notesHandlers = [
  http.get('*/api/v1/topics/:topicId/notes/official', ({ params }) => {
    const topicId = params.topicId as string
    return HttpResponse.json(
      buildNoteResponseList(2, { topic_id: topicId, is_official: true }),
    )
  }),

  http.get('*/api/v1/notes', () => {
    return HttpResponse.json(buildNoteResponseList(3))
  }),

  http.post('*/api/v1/notes', () => {
    return HttpResponse.json(buildNoteResponse(), { status: 201 })
  }),

  http.patch('*/api/v1/notes/:noteId', ({ params }) => {
    const noteId = params.noteId as string
    return HttpResponse.json(
      buildNoteResponse({ id: noteId, title: 'Updated Note' }),
    )
  }),

  http.delete('*/api/v1/notes/:noteId', ({ params }) => {
    const noteId = params.noteId as string
    return HttpResponse.json({ success: true, note_id: noteId })
  }),
]

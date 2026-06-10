import type {
  AiNote,
  NotesOverview,
  Reference,
  TeacherNote,
} from '@aspiron/api-client'
import {
  buildAiNote,
  buildReference,
  buildTeacherNote,
} from '@mock/factories/notes-manager.factory'
import { HttpResponse, http } from 'msw'

// In-memory store per topic so mutations persist within a test session
const teacherNotesStore = new Map<string, TeacherNote>()
const aiNotesStore = new Map<string, AiNote[]>()
const referencesStore = new Map<string, Reference[]>()

function initTopic(topicId: string) {
  if (!teacherNotesStore.has(topicId)) {
    teacherNotesStore.set(
      topicId,
      buildTeacherNote({ id: `${topicId}-teacher-note` }),
    )
  }
  if (!aiNotesStore.has(topicId)) {
    aiNotesStore.set(topicId, [
      buildAiNote({ id: `${topicId}-ai-1` }),
      buildAiNote({
        id: `${topicId}-ai-2`,
        title: 'Key Formulas',
        status: 'approved',
      }),
    ])
  }
  if (!referencesStore.has(topicId)) {
    referencesStore.set(topicId, [])
  }
}

function getOverview(topicId: string): NotesOverview {
  initTopic(topicId)
  const teacher = teacherNotesStore.get(topicId)!
  const aiNotes = aiNotesStore.get(topicId)!
  const refs = referencesStore.get(topicId)!
  return {
    teacher_notes_status: teacher.status,
    ai_notes_status: aiNotes.some((n) => n.status === 'pending_review')
      ? 'pending_review'
      : aiNotes.every((n) => n.status === 'approved')
        ? 'approved'
        : 'none',
    external_references_count: refs.length,
    student_engagement: 45,
  }
}

export const notesManagerHandlers = [
  // GET /topics/:topicId/notes/overview
  http.get('*/api/v1/topics/:topicId/notes/overview', ({ params }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') {
      return HttpResponse.json(null, { status: 404 })
    }
    return HttpResponse.json(getOverview(topicId))
  }),

  // GET /topics/:topicId/notes — teacher notes
  http.get('*/api/v1/topics/:topicId/notes', ({ params }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
    initTopic(topicId)
    return HttpResponse.json(teacherNotesStore.get(topicId)!)
  }),

  // PUT /topics/:topicId/notes — update teacher notes
  http.put('*/api/v1/topics/:topicId/notes', async ({ params, request }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
    initTopic(topicId)
    const body = (await request.json()) as {
      content?: string
      status?: string | null
    }
    const existing = teacherNotesStore.get(topicId)!
    const updated: TeacherNote = {
      ...existing,
      content: body.content ?? existing.content,
      status: body.status ?? existing.status,
      updated_at: new Date().toISOString(),
    }
    teacherNotesStore.set(topicId, updated)
    return HttpResponse.json(updated)
  }),

  // POST /topics/:topicId/notes/publish
  http.post('*/api/v1/topics/:topicId/notes/publish', ({ params }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
    initTopic(topicId)
    const existing = teacherNotesStore.get(topicId)!
    const updated: TeacherNote = {
      ...existing,
      status: 'published',
      updated_at: new Date().toISOString(),
    }
    teacherNotesStore.set(topicId, updated)
    return HttpResponse.json(updated)
  }),

  // POST /topics/:topicId/notes/unpublish
  http.post('*/api/v1/topics/:topicId/notes/unpublish', ({ params }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
    initTopic(topicId)
    const existing = teacherNotesStore.get(topicId)!
    const updated: TeacherNote = {
      ...existing,
      status: 'draft',
      updated_at: new Date().toISOString(),
    }
    teacherNotesStore.set(topicId, updated)
    return HttpResponse.json(updated)
  }),

  // GET /topics/:topicId/ai-notes
  http.get('*/api/v1/topics/:topicId/ai-notes', ({ params }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
    initTopic(topicId)
    return HttpResponse.json(aiNotesStore.get(topicId)!)
  }),

  // POST /topics/:topicId/ai-notes/:noteId/approve
  http.post(
    '*/api/v1/topics/:topicId/ai-notes/:noteId/approve',
    ({ params }) => {
      const topicId = params.topicId as string
      const noteId = params.noteId as string
      if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
      initTopic(topicId)
      const notes = aiNotesStore.get(topicId)!
      const idx = notes.findIndex((n) => n.id === noteId)
      if (idx === -1) return HttpResponse.json(null, { status: 404 })
      const updated: AiNote = { ...notes[idx], status: 'approved' }
      notes[idx] = updated
      aiNotesStore.set(topicId, notes)
      return HttpResponse.json(updated)
    },
  ),

  // GET /topics/:topicId/references
  http.get('*/api/v1/topics/:topicId/references', ({ params }) => {
    const topicId = params.topicId as string
    if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
    initTopic(topicId)
    return HttpResponse.json(referencesStore.get(topicId)!)
  }),

  // POST /topics/:topicId/references — create reference
  http.post(
    '*/api/v1/topics/:topicId/references',
    async ({ params, request }) => {
      const topicId = params.topicId as string
      if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
      initTopic(topicId)
      const body = (await request.json()) as {
        title?: string
        source?: string
        reference_type?: string
        url?: string
      }
      const ref = buildReference({
        title: body.title ?? 'Untitled',
        source: body.source ?? '',
        reference_type: body.reference_type ?? 'URL',
        url: body.url ?? '',
      })
      const refs = referencesStore.get(topicId)!
      refs.push(ref)
      referencesStore.set(topicId, refs)
      return HttpResponse.json(ref, { status: 201 })
    },
  ),

  // DELETE /topics/:topicId/references/:referenceId
  http.delete(
    '*/api/v1/topics/:topicId/references/:referenceId',
    ({ params }) => {
      const topicId = params.topicId as string
      const referenceId = params.referenceId as string
      if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
      initTopic(topicId)
      const refs = referencesStore.get(topicId)!
      const idx = refs.findIndex((r) => r.id === referenceId)
      if (idx === -1) return HttpResponse.json(null, { status: 404 })
      refs.splice(idx, 1)
      referencesStore.set(topicId, refs)
      return HttpResponse.json({ success: true })
    },
  ),

  // POST /topics/:topicId/references/:referenceId/toggle
  http.post(
    '*/api/v1/topics/:topicId/references/:referenceId/toggle',
    ({ params }) => {
      const topicId = params.topicId as string
      const referenceId = params.referenceId as string
      if (topicId === 'unknown') return HttpResponse.json(null, { status: 404 })
      initTopic(topicId)
      const refs = referencesStore.get(topicId)!
      const idx = refs.findIndex((r) => r.id === referenceId)
      if (idx === -1) return HttpResponse.json(null, { status: 404 })
      const updated: Reference = {
        ...refs[idx],
        visible: !refs[idx].visible,
      }
      refs[idx] = updated
      referencesStore.set(topicId, refs)
      return HttpResponse.json(updated)
    },
  ),
]

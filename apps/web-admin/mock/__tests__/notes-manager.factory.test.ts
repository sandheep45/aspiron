import {
  buildAiNote,
  buildAiNoteList,
  buildNotesOverview,
  buildReference,
  buildReferenceList,
  buildTeacherNote,
  resetIdCounter,
} from '@mock/factories/notes-manager.factory'
import { describe, expect, it } from 'vitest'

describe('notes-manager factory', () => {
  describe('buildNotesOverview', () => {
    it('creates with default values', () => {
      const overview = buildNotesOverview()
      expect(overview.teacher_notes_status).toBe('draft')
      expect(overview.ai_notes_status).toBe('none')
      expect(overview.external_references_count).toBe(0)
      expect(overview.student_engagement).toBe(0)
    })

    it('overrides fields', () => {
      const overview = buildNotesOverview({
        teacher_notes_status: 'published',
        external_references_count: 5,
      })
      expect(overview.teacher_notes_status).toBe('published')
      expect(overview.external_references_count).toBe(5)
    })
  })

  describe('buildTeacherNote', () => {
    it('creates with default values', () => {
      resetIdCounter()
      const note = buildTeacherNote()
      expect(note.id).toBe('note-1')
      expect(note.status).toBe('draft')
      expect(note.content).toContain('teacher')
    })

    it('overrides fields', () => {
      const note = buildTeacherNote({ status: 'published' })
      expect(note.status).toBe('published')
    })
  })

  describe('buildAiNote', () => {
    it('creates with default values', () => {
      resetIdCounter()
      const note = buildAiNote()
      expect(note.id).toBe('ai-1')
      expect(note.status).toBe('pending_review')
      expect(note.title).toBe('AI Generated Summary')
    })

    it('overrides fields', () => {
      const note = buildAiNote({ status: 'approved' })
      expect(note.status).toBe('approved')
    })
  })

  describe('buildReference', () => {
    it('creates with default values', () => {
      resetIdCounter()
      const ref = buildReference()
      expect(ref.id).toBe('ref-1')
      expect(ref.reference_type).toBe('URL')
      expect(ref.visible).toBe(true)
    })

    it('overrides fields', () => {
      const ref = buildReference({ visible: false, reference_type: 'Video' })
      expect(ref.visible).toBe(false)
      expect(ref.reference_type).toBe('Video')
    })
  })

  describe('buildAiNoteList', () => {
    it('creates the requested number of notes', () => {
      const notes = buildAiNoteList(3)
      expect(notes).toHaveLength(3)
    })
  })

  describe('buildReferenceList', () => {
    it('creates the requested number of references', () => {
      const refs = buildReferenceList(3)
      expect(refs).toHaveLength(3)
    })
  })

  describe('counter', () => {
    it('increments across multiple build calls', () => {
      resetIdCounter()
      const ref1 = buildReference()
      const ref2 = buildReference()
      expect(ref1.id).toBe('ref-1')
      expect(ref2.id).toBe('ref-2')
    })

    it('resetIdCounter resets counter', () => {
      buildReference()
      buildReference()
      resetIdCounter()
      const ref = buildReference()
      expect(ref.id).toBe('ref-1')
    })
  })
})

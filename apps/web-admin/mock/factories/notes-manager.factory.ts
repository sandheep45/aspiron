import type {
  AiNote,
  NotesOverview,
  Reference,
  TeacherNote,
} from '@aspiron/api-client'

let nextId = 1

export function resetIdCounter() {
  nextId = 1
}

function uid(prefix = 'ref') {
  return `${prefix}-${nextId++}`
}

export function buildNotesOverview(
  overrides?: Partial<NotesOverview>,
): NotesOverview {
  return {
    teacher_notes_status: 'draft',
    ai_notes_status: 'none',
    external_references_count: 0,
    student_engagement: 0,
    ...overrides,
  }
}

export function buildTeacherNote(
  overrides?: Partial<TeacherNote>,
): TeacherNote {
  return {
    id: uid('note'),
    content: '<p>This is a sample teacher note.</p>',
    status: 'draft',
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function buildAiNote(overrides?: Partial<AiNote>): AiNote {
  return {
    id: uid('ai'),
    title: 'AI Generated Summary',
    content:
      '<p>This topic covers key concepts including definitions, examples, and practice problems.</p>',
    status: 'pending_review',
    generated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function buildReference(overrides?: Partial<Reference>): Reference {
  return {
    id: uid('ref'),
    title: 'Reference Resource',
    source: 'Wikipedia',
    reference_type: 'URL',
    url: 'https://example.com/resource',
    visible: true,
    ...overrides,
  }
}

export function buildAiNoteList(
  count: number,
  overrides?: Partial<AiNote>,
): AiNote[] {
  return Array.from({ length: count }, (_, i) =>
    buildAiNote({
      id: `ai-${nextId++}`,
      title: `AI Note ${i + 1}`,
      ...overrides,
    }),
  )
}

export function buildReferenceList(
  count: number,
  overrides?: Partial<Reference>,
): Reference[] {
  return Array.from({ length: count }, (_, i) =>
    buildReference({
      id: `ref-${nextId++}`,
      title: `Reference ${i + 1}`,
      ...overrides,
    }),
  )
}

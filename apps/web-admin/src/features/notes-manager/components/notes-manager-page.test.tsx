import type {
  AiNote,
  NotesOverview,
  Reference,
  TeacherNote,
} from '@aspiron/api-client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NotesManagerPage } from '@/features/notes-manager/components/notes-manager-page'

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockQueries, mockMutations, mockToast } = vi.hoisted(() => ({
  mockQueries: {
    useNotesOverviewQuery: vi.fn(),
    useTeacherNotesQuery: vi.fn(),
    useAiNotesQuery: vi.fn(),
    useReferencesQuery: vi.fn(),
  },
  mockMutations: {
    useUpdateTeacherNotesMutation: vi.fn(),
    usePublishNotesMutation: vi.fn(),
    useUnpublishNotesMutation: vi.fn(),
    useApproveAiNotesMutation: vi.fn(),
    useCreateReferenceMutation: vi.fn(),
    useDeleteReferenceMutation: vi.fn(),
    useToggleReferenceVisibilityMutation: vi.fn(),
  },
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useNotesOverviewQuery: mockQueries.useNotesOverviewQuery,
  useTeacherNotesQuery: mockQueries.useTeacherNotesQuery,
  useAiNotesQuery: mockQueries.useAiNotesQuery,
  useReferencesQuery: mockQueries.useReferencesQuery,
  useUpdateTeacherNotesMutation: mockMutations.useUpdateTeacherNotesMutation,
  usePublishNotesMutation: mockMutations.usePublishNotesMutation,
  useUnpublishNotesMutation: mockMutations.useUnpublishNotesMutation,
  useApproveAiNotesMutation: mockMutations.useApproveAiNotesMutation,
  useCreateReferenceMutation: mockMutations.useCreateReferenceMutation,
  useDeleteReferenceMutation: mockMutations.useDeleteReferenceMutation,
  useToggleReferenceVisibilityMutation:
    mockMutations.useToggleReferenceVisibilityMutation,
}))

vi.mock('sonner', () => ({
  toast: mockToast,
}))

vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: vi.fn() }),
        toggleItalic: () => ({ run: vi.fn() }),
        toggleCode: () => ({ run: vi.fn() }),
        toggleHeading: () => ({ run: vi.fn() }),
        toggleBulletList: () => ({ run: vi.fn() }),
        toggleOrderedList: () => ({ run: vi.fn() }),
        toggleBlockquote: () => ({ run: vi.fn() }),
        toggleCodeBlock: () => ({ run: vi.fn() }),
        undo: () => ({ run: vi.fn() }),
        redo: () => ({ run: vi.fn() }),
      }),
    }),
    isActive: vi.fn(() => false),
    getHTML: vi.fn(() => '<p>test</p>'),
  }),
  EditorContent: () => <div data-testid='editor-content' />,
}))

vi.mock('@tiptap/extension-placeholder', () => ({
  default: { configure: vi.fn() },
}))

// ── Test data ──────────────────────────────────────────────────────────────

const overviewData: NotesOverview = {
  teacher_notes_status: 'published',
  ai_notes_status: 'approved',
  external_references_count: 3,
  student_engagement: 72,
}

const teacherNoteData: TeacherNote = {
  id: 'note-1',
  content: '<p>Teacher content</p>',
  status: 'draft',
  updated_at: '2026-06-01T00:00:00Z',
}

const publishedTeacherNoteData: TeacherNote = {
  ...teacherNoteData,
  status: 'published',
}

const aiNotesData: AiNote[] = [
  {
    id: 'ai-1',
    title: 'Summary',
    content: '<p>AI summary</p>',
    status: 'pending_review',
    generated_at: '2026-06-01T00:00:00Z',
  },
]

const refsData: Reference[] = [
  {
    id: 'ref-1',
    title: 'External Link',
    source: 'Web',
    reference_type: 'URL',
    url: 'https://example.com',
    visible: true,
  },
]

function createMutationMock() {
  return {
    mutateAsync: vi.fn(),
    isPending: false,
  }
}

function defaultQueryMock<T>(data: T) {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }
}

function renderPage() {
  return render(<NotesManagerPage topicId='topic-1' onBack={vi.fn()} />)
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('NotesManagerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueries.useNotesOverviewQuery.mockReturnValue(
      defaultQueryMock(overviewData),
    )
    mockQueries.useTeacherNotesQuery.mockReturnValue(
      defaultQueryMock(teacherNoteData),
    )
    mockQueries.useAiNotesQuery.mockReturnValue(defaultQueryMock(aiNotesData))
    mockQueries.useReferencesQuery.mockReturnValue(defaultQueryMock(refsData))

    mockMutations.useUpdateTeacherNotesMutation.mockReturnValue(
      createMutationMock(),
    )
    mockMutations.usePublishNotesMutation.mockReturnValue(createMutationMock())
    mockMutations.useUnpublishNotesMutation.mockReturnValue(
      createMutationMock(),
    )
    mockMutations.useApproveAiNotesMutation.mockReturnValue(
      createMutationMock(),
    )
    mockMutations.useCreateReferenceMutation.mockReturnValue(
      createMutationMock(),
    )
    mockMutations.useDeleteReferenceMutation.mockReturnValue(
      createMutationMock(),
    )
    mockMutations.useToggleReferenceVisibilityMutation.mockReturnValue(
      createMutationMock(),
    )
  })

  it('renders page header with back button', () => {
    renderPage()
    expect(screen.getByText('Back to Topic Detail')).toBeInTheDocument()
    expect(screen.getByText('Notes Manager')).toBeInTheDocument()
  })

  it('renders all 5 sections', () => {
    renderPage()
    expect(screen.getByText('Notes Overview')).toBeInTheDocument()
    expect(screen.getAllByText('Teacher Notes').length).toBeGreaterThanOrEqual(
      1,
    )
    expect(screen.getByText('AI Generated Notes')).toBeInTheDocument()
    expect(
      screen.getAllByText('External References').length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('shows loading skeletons when overview is loading', () => {
    mockQueries.useNotesOverviewQuery.mockReturnValue({
      ...defaultQueryMock(undefined),
      data: undefined,
      isLoading: true,
    })
    const { container } = renderPage()
    expect(
      container.querySelector('[class*="animate-pulse"]'),
    ).toBeInTheDocument()
  })

  it('shows error state with retry for overview', () => {
    mockQueries.useNotesOverviewQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
      refetch: vi.fn(),
    })
    renderPage()
    expect(screen.getByText('Network error')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('calls toast.success on save mutation success', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    mockMutations.useUpdateTeacherNotesMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })
    renderPage()
    await user.click(screen.getByText('Save Changes'))
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Notes saved')
    })
  })

  it('calls toast.error on save mutation failure', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn().mockRejectedValue(new Error('fail'))
    mockMutations.useUpdateTeacherNotesMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })
    renderPage()
    await user.click(screen.getByText('Save Changes'))
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to save notes')
    })
  })

  it('calls toast.success on publish mutation success', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    mockMutations.usePublishNotesMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })
    renderPage()
    await user.click(screen.getByText('Publish Notes'))
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Notes published')
    })
  })

  it('calls toast.success on approve AI note mutation success', async () => {
    const user = userEvent.setup()
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    mockMutations.useApproveAiNotesMutation.mockReturnValue({
      mutateAsync,
      isPending: false,
    })
    renderPage()
    await user.click(screen.getByText('Approve & Publish'))
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('AI note approved')
    })
  })

  it('opens add reference dialog on button click', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Add Reference' }))
    expect(
      screen.getByRole('heading', { name: 'Add Reference' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Link Resource' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Upload File' })).toBeInTheDocument()
  })

  it('shows Publish button enabled when status is draft', () => {
    renderPage()
    const publishBtn = screen.getByRole('button', { name: 'Publish Notes' })
    expect(publishBtn).toBeEnabled()
  })

  it('shows Unpublish button disabled when status is draft', () => {
    renderPage()
    const unpublishBtn = screen.getByRole('button', { name: 'Unpublish Notes' })
    expect(unpublishBtn).toBeDisabled()
  })

  it('shows Publish disabled and Unpublish enabled when status is published', () => {
    mockQueries.useTeacherNotesQuery.mockReturnValue(
      defaultQueryMock(publishedTeacherNoteData),
    )
    renderPage()
    expect(screen.getByRole('button', { name: 'Publish Notes' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Unpublish Notes' }),
    ).toBeEnabled()
  })

  it('renders Quick Actions bar with all 6 buttons', () => {
    renderPage()
    expect(screen.getByText('Preview as Student')).toBeInTheDocument()
    expect(screen.getByText('Mark as Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Temporarily Hide')).toBeInTheDocument()
    expect(screen.getByText('Generate AI Summary')).toBeInTheDocument()
    expect(screen.getByText('Export Notes')).toBeInTheDocument()
    expect(screen.getByText('Duplicate Notes')).toBeInTheDocument()
  })
})

import type { AiNote } from '@aspiron/api-client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AiNotesReview } from '@/features/notes-manager/components/ai-notes-review'

const createMockEditor = (overrides?: Record<string, unknown>) => ({
  chain: () => ({
    focus: () => ({
      toggleBold: () => ({ run: vi.fn() }),
      toggleItalic: () => ({ run: vi.fn() }),
      toggleUnderline: () => ({ run: vi.fn() }),
      toggleHeading: () => ({ run: vi.fn() }),
      toggleBulletList: () => ({ run: vi.fn() }),
      toggleOrderedList: () => ({ run: vi.fn() }),
      undo: () => ({ run: vi.fn() }),
      redo: () => ({ run: vi.fn() }),
    }),
  }),
  isActive: vi.fn(() => false),
  getHTML: vi.fn(() => '<p>Mock content</p>'),
  getText: vi.fn(() => 'Mock content'),
  getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
  ...overrides,
})

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => createMockEditor()),
  EditorContent: () => <div data-testid='editor-content' />,
}))

const mockNotes: AiNote[] = [
  {
    id: 'ai-1',
    title: 'Key Concepts',
    content: '<p>Core concepts explained.</p>',
    status: 'pending_review',
    generated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'ai-2',
    title: 'Important Formulas',
    content: '<p>Formula list here.</p>',
    status: 'approved',
    generated_at: '2026-06-01T11:00:00Z',
  },
]

describe('AiNotesReview', () => {
  it('renders loading skeleton', () => {
    const { container } = render(
      <AiNotesReview
        notes={undefined}
        loading
        onApprove={vi.fn()}
        onEdit={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Key Concepts')).not.toBeInTheDocument()
  })

  it('renders empty state when no notes', () => {
    render(
      <AiNotesReview
        notes={[]}
        loading={false}
        onApprove={vi.fn()}
        onEdit={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    expect(
      screen.getByText('No AI-generated notes available'),
    ).toBeInTheDocument()
  })

  it('renders note cards with titles', () => {
    render(
      <AiNotesReview
        notes={mockNotes}
        loading={false}
        onApprove={vi.fn()}
        onEdit={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    expect(screen.getByText('Key Concepts')).toBeInTheDocument()
    expect(screen.getByText('Important Formulas')).toBeInTheDocument()
  })

  it('shows warning banner', () => {
    render(
      <AiNotesReview
        notes={mockNotes}
        loading={false}
        onApprove={vi.fn()}
        onEdit={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    expect(
      screen.getByText(
        'AI-generated notes must be reviewed and approved before publishing.',
      ),
    ).toBeInTheDocument()
  })

  it('calls onApprove with note id', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn()
    render(
      <AiNotesReview
        notes={[mockNotes[0]]}
        loading={false}
        onApprove={onApprove}
        onEdit={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    await user.click(screen.getByText('Approve & Publish'))
    expect(onApprove).toHaveBeenCalledWith('ai-1')
  })

  it('calls onEdit with note object', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <AiNotesReview
        notes={[mockNotes[0]]}
        loading={false}
        onApprove={vi.fn()}
        onEdit={onEdit}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    await user.click(screen.getByText('Edit Before Publishing'))
    expect(onEdit).toHaveBeenCalledWith(mockNotes[0])
  })

  it('calls onReject with note id', async () => {
    const user = userEvent.setup()
    const onReject = vi.fn()
    render(
      <AiNotesReview
        notes={[mockNotes[0]]}
        loading={false}
        onApprove={vi.fn()}
        onEdit={vi.fn()}
        onReject={onReject}
        isApproving={false}
      />,
    )
    await user.click(screen.getByText('Reject & Regenerate'))
    expect(onReject).toHaveBeenCalledWith('ai-1')
  })

  it('disables approve button for already approved notes', () => {
    render(
      <AiNotesReview
        notes={mockNotes}
        loading={false}
        onApprove={vi.fn()}
        onEdit={vi.fn()}
        onReject={vi.fn()}
        isApproving={false}
      />,
    )
    const approveButtons = screen.getAllByText('Approve & Publish')
    expect(approveButtons[1]).toBeDisabled()
  })
})

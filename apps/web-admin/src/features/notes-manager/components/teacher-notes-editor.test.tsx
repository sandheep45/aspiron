import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TeacherNotesEditor } from '@/features/notes-manager/components/teacher-notes-editor'

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
  getHTML: vi.fn(() => '<p>Editor content</p>'),
  getText: vi.fn(() => 'Editor content'),
  getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
  ...overrides,
})

const mockEditor = createMockEditor()

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: () => <div data-testid='editor-content' />,
}))

vi.mock('@tiptap/extension-placeholder', () => ({
  default: { configure: vi.fn() },
}))

const defaultProps = {
  content: '<p>Initial content</p>',
  status: 'draft',
  onSave: vi.fn(),
  onPublish: vi.fn(),
  onUnpublish: vi.fn(),
  onPreview: vi.fn(),
  isSaving: false,
  isPublishing: false,
  isUnpublishing: false,
}

describe('TeacherNotesEditor', () => {
  it('renders editor with toolbar buttons', () => {
    render(<TeacherNotesEditor {...defaultProps} />)
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Italic')).toBeInTheDocument()
    expect(screen.getByTitle('Underline')).toBeInTheDocument()
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument()
    expect(screen.getByTitle('Heading 3')).toBeInTheDocument()
    expect(screen.getByTitle('Bullet List')).toBeInTheDocument()
    expect(screen.getByTitle('Undo')).toBeInTheDocument()
    expect(screen.getByTitle('Redo')).toBeInTheDocument()
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders Save Changes button', () => {
    render(<TeacherNotesEditor {...defaultProps} />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('calls onSave with editor content when Save clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<TeacherNotesEditor {...defaultProps} onSave={onSave} />)
    await user.click(screen.getByText('Save Changes'))
    await vi.waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('calls onPublish when Publish clicked and status is draft', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn()
    render(<TeacherNotesEditor {...defaultProps} onPublish={onPublish} />)
    await user.click(screen.getByText('Publish Notes'))
    expect(onPublish).toHaveBeenCalledTimes(1)
  })

  it('disables Publish when status is already published', () => {
    render(<TeacherNotesEditor {...defaultProps} status='published' />)
    expect(screen.getByText('Publish Notes').closest('button')).toBeDisabled()
  })

  it('calls onUnpublish when Unpublish clicked and status is published', async () => {
    const user = userEvent.setup()
    const onUnpublish = vi.fn()
    render(
      <TeacherNotesEditor
        {...defaultProps}
        status='published'
        onUnpublish={onUnpublish}
      />,
    )
    const unpublishBtn = screen.getByText('Unpublish Notes')
    expect(unpublishBtn.closest('button')).not.toBeDisabled()
    await user.click(unpublishBtn)
    expect(onUnpublish).toHaveBeenCalledTimes(1)
  })

  it('disables Unpublish when status is draft', () => {
    render(<TeacherNotesEditor {...defaultProps} status='draft' />)
    expect(screen.getByText('Unpublish Notes').closest('button')).toBeDisabled()
  })

  it('disables Save Changes while saving', () => {
    render(<TeacherNotesEditor {...defaultProps} isSaving />)
    expect(screen.getByText('Save Changes').closest('button')).toBeDisabled()
  })

  it('calls onPreview when Preview clicked', async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()
    render(<TeacherNotesEditor {...defaultProps} onPreview={onPreview} />)
    await user.click(screen.getByText('Preview Student View'))
    expect(onPreview).toHaveBeenCalledTimes(1)
  })
})

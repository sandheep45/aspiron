import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuickActionsBar } from '@/features/notes-manager/components/quick-actions-bar'

describe('QuickActionsBar', () => {
  it('renders all 6 action buttons', () => {
    render(
      <QuickActionsBar
        onPreviewAsStudent={vi.fn()}
        onMarkReviewed={vi.fn()}
        onTemporarilyHide={vi.fn()}
        onGenerateAiSummary={vi.fn()}
        onExportNotes={vi.fn()}
        onDuplicateNotes={vi.fn()}
      />,
    )
    expect(screen.getByText('Preview as Student')).toBeInTheDocument()
    expect(screen.getByText('Mark as Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Temporarily Hide')).toBeInTheDocument()
    expect(screen.getByText('Generate AI Summary')).toBeInTheDocument()
    expect(screen.getByText('Export Notes')).toBeInTheDocument()
    expect(screen.getByText('Duplicate Notes')).toBeInTheDocument()
  })

  it('enabled buttons call their handlers on click', async () => {
    const user = userEvent.setup()
    const handlers = {
      onPreviewAsStudent: vi.fn(),
      onMarkReviewed: vi.fn(),
      onTemporarilyHide: vi.fn(),
      onGenerateAiSummary: vi.fn(),
      onExportNotes: vi.fn(),
      onDuplicateNotes: vi.fn(),
    }
    render(<QuickActionsBar {...handlers} />)

    await user.click(screen.getByText('Preview as Student'))
    expect(handlers.onPreviewAsStudent).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Mark as Reviewed'))
    expect(handlers.onMarkReviewed).toHaveBeenCalledTimes(1)

    await user.click(screen.getByText('Generate AI Summary'))
    expect(handlers.onGenerateAiSummary).toHaveBeenCalledTimes(1)
  })

  it('disabled buttons have disabled attribute', () => {
    render(
      <QuickActionsBar
        onPreviewAsStudent={vi.fn()}
        onMarkReviewed={vi.fn()}
        onTemporarilyHide={vi.fn()}
        onGenerateAiSummary={vi.fn()}
        onExportNotes={vi.fn()}
        onDuplicateNotes={vi.fn()}
        previewDisabled
        generateDisabled
        exportDisabled
        duplicateDisabled
      />,
    )
    expect(
      screen.getByText('Preview as Student').closest('button'),
    ).toBeDisabled()
    expect(
      screen.getByText('Generate AI Summary').closest('button'),
    ).toBeDisabled()
    expect(screen.getByText('Export Notes').closest('button')).toBeDisabled()
    expect(screen.getByText('Duplicate Notes').closest('button')).toBeDisabled()
  })

  it('disabled buttons do not fire handlers', async () => {
    const user = userEvent.setup()
    const onPreviewAsStudent = vi.fn()
    render(
      <QuickActionsBar
        onPreviewAsStudent={onPreviewAsStudent}
        onMarkReviewed={vi.fn()}
        onTemporarilyHide={vi.fn()}
        onGenerateAiSummary={vi.fn()}
        onExportNotes={vi.fn()}
        onDuplicateNotes={vi.fn()}
        previewDisabled
      />,
    )
    await user.click(screen.getByText('Preview as Student'))
    expect(onPreviewAsStudent).not.toHaveBeenCalled()
  })
})

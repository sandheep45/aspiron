import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReferenceDialog } from '@/features/notes-manager/components/reference-dialog'

const mockOnSubmit = vi.fn()

function renderDialog(open = true) {
  return render(
    <ReferenceDialog
      open={open}
      onOpenChange={vi.fn()}
      onSubmit={mockOnSubmit}
    />,
  )
}

describe('ReferenceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog with title and tabs when open', () => {
    renderDialog()
    expect(
      screen.getByRole('heading', { name: 'Add Reference' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: 'Link Resource' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Upload File' })).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    const { container } = renderDialog(false)
    expect(container.textContent).not.toContain('Add Reference')
  })

  it('shows form fields in URL mode', () => {
    renderDialog()
    expect(
      screen.getByPlaceholderText('Enter reference title'),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('https://example.com/resource'),
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('e.g., Wikipedia, Khan Academy'),
    ).toBeInTheDocument()
  })

  it('switches to Upload tab showing file picker', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('tab', { name: 'Upload File' }))
    expect(screen.getByText('Choose a file to upload')).toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText('https://example.com/resource'),
    ).not.toBeInTheDocument()
  })

  it('switches back to URL tab showing URL input', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('tab', { name: 'Upload File' }))
    await user.click(screen.getByRole('tab', { name: 'Link Resource' }))
    expect(
      screen.getByPlaceholderText('https://example.com/resource'),
    ).toBeInTheDocument()
  })

  it('shows Submit and Cancel buttons', () => {
    renderDialog()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Add Reference' }),
    ).toBeInTheDocument()
  })

  it('submits form with correct values', async () => {
    const user = userEvent.setup()
    renderDialog()
    mockOnSubmit.mockResolvedValueOnce(undefined)

    await user.type(
      screen.getByPlaceholderText('Enter reference title'),
      'Test Ref',
    )
    await user.type(
      screen.getByPlaceholderText('e.g., Wikipedia, Khan Academy'),
      'Test Source',
    )
    await user.type(
      screen.getByPlaceholderText('https://example.com/resource'),
      'https://example.com/test',
    )

    await user.click(screen.getByRole('button', { name: 'Add Reference' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Ref',
          source: 'Test Source',
          referenceType: 'URL',
          url: 'https://example.com/test',
        }),
      )
    })
  })

  it('calls onOpenChange(false) via Cancel button', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ReferenceDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={mockOnSubmit}
      />,
    )
    await user.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

import type { Reference } from '@aspiron/api-client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReferencesTable } from '@/features/notes-manager/components/references-table'

const mockRefs: Reference[] = [
  {
    id: 'ref-1',
    title: 'Khan Academy Video',
    source: 'Khan Academy',
    reference_type: 'Video',
    url: 'https://khanacademy.org/video',
    visible: true,
  },
  {
    id: 'ref-2',
    title: 'Research Paper',
    source: 'https://example.com/paper',
    reference_type: 'Research Paper',
    url: 'https://example.com/paper',
    visible: false,
  },
]

describe('ReferencesTable', () => {
  it('renders loading skeleton', () => {
    const { container } = render(
      <ReferencesTable
        references={undefined}
        loading
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggleVisibility={vi.fn()}
        isDeleting={false}
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Khan Academy Video')).not.toBeInTheDocument()
  })

  it('renders empty state when no references', () => {
    render(
      <ReferencesTable
        references={[]}
        loading={false}
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggleVisibility={vi.fn()}
        isDeleting={false}
      />,
    )
    expect(screen.getByText('No External References')).toBeInTheDocument()
    expect(screen.getAllByText('Add Reference').length).toBeGreaterThanOrEqual(
      1,
    )
  })

  it('renders reference rows with type badges', () => {
    render(
      <ReferencesTable
        references={mockRefs}
        loading={false}
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggleVisibility={vi.fn()}
        isDeleting={false}
      />,
    )
    expect(screen.getByText('Khan Academy Video')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
    // "Research Paper" appears twice (title + badge); verify it's present
    expect(screen.getAllByText('Research Paper')).toHaveLength(2)
  })

  it('renders Open link for each reference', () => {
    render(
      <ReferencesTable
        references={mockRefs}
        loading={false}
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggleVisibility={vi.fn()}
        isDeleting={false}
      />,
    )
    const links = screen.getAllByText('Open link')
    expect(links).toHaveLength(2)
  })

  it('renders source label as "Uploaded File" when source is a URL', () => {
    render(
      <ReferencesTable
        references={[mockRefs[1]]}
        loading={false}
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggleVisibility={vi.fn()}
        isDeleting={false}
      />,
    )
    expect(screen.getByText('Uploaded File')).toBeInTheDocument()
  })

  it('calls onToggleVisibility when switch clicked', async () => {
    const user = userEvent.setup()
    const onToggleVisibility = vi.fn()
    render(
      <ReferencesTable
        references={mockRefs}
        loading={false}
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onToggleVisibility={onToggleVisibility}
        isDeleting={false}
      />,
    )
    const switches = screen.getAllByRole('switch')
    await user.click(switches[0])
    expect(onToggleVisibility).toHaveBeenCalledWith('ref-1')
  })

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ReferencesTable
        references={mockRefs}
        loading={false}
        topicId='topic-1'
        onAdd={vi.fn()}
        onDelete={onDelete}
        onToggleVisibility={vi.fn()}
        isDeleting={false}
      />,
    )
    const deleteBtns = screen
      .getAllByRole('button')
      .filter(
        (btn) =>
          btn.querySelector('svg') &&
          !btn.textContent?.includes('Add Reference'),
      )
    await user.click(deleteBtns[0])
    expect(onDelete).toHaveBeenCalledWith('ref-1')
  })
})

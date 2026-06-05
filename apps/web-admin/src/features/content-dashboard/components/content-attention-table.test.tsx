import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ContentAttentionTable } from '@/features/content-dashboard/components/content-attention-table'

const mockItems = [
  {
    id: '1',
    topic: 'Physics',
    issue: 'Low Recall',
    reason: 'Students showing recall decline',
    students_affected: 23 as unknown as bigint,
  },
  {
    id: '2',
    topic: 'Chemistry',
    issue: 'Poor Accuracy',
    reason: 'Accuracy below 60% threshold',
    students_affected: 15 as unknown as bigint,
  },
  {
    id: '3',
    topic: 'Biology',
    issue: 'High Drop-off',
    reason: 'More than 40% students disengaged',
    students_affected: 30 as unknown as bigint,
  },
]

describe('ContentAttentionTable', () => {
  const defaultProps = {
    items: mockItems,
    total: 3,
    search: '',
    onSearchChange: vi.fn(),
    issueFilter: '',
    onIssueFilterChange: vi.fn(),
    sortBy: 'students' as const,
    sortOrder: 'desc' as const,
    onSortChange: vi.fn(),
    page: 1,
    limit: 5,
    onPageChange: vi.fn(),
  }

  it('renders table with items', () => {
    render(<ContentAttentionTable {...defaultProps} />)
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('Chemistry')).toBeInTheDocument()
    expect(screen.getByText('Biology')).toBeInTheDocument()
  })

  it('renders issue badges', () => {
    render(<ContentAttentionTable {...defaultProps} />)
    expect(screen.getByText('Low Recall')).toBeInTheDocument()
    expect(screen.getByText('Poor Accuracy')).toBeInTheDocument()
    expect(screen.getByText('High Drop-off')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <ContentAttentionTable {...defaultProps} loading />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders empty state when no items', () => {
    render(<ContentAttentionTable {...defaultProps} items={[]} total={0} />)
    expect(screen.getByText('No items need attention')).toBeInTheDocument()
  })

  it('shows pagination info', () => {
    render(<ContentAttentionTable {...defaultProps} total={10} limit={3} />)
    expect(screen.getByText(/Showing 1–3 of 10/)).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ContentAttentionTable
        {...defaultProps}
        onSearchChange={onSearchChange}
      />,
    )
    const input = screen.getByPlaceholderText('Search topics or issues...')
    await user.type(input, 'phy')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('renders filter dropdown with issue options', () => {
    render(<ContentAttentionTable {...defaultProps} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All Issues')).toBeInTheDocument()
  })

  it('calls onSortChange when clicking column header', async () => {
    const onSortChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ContentAttentionTable {...defaultProps} onSortChange={onSortChange} />,
    )
    await user.click(screen.getByText('Topic'))
    expect(onSortChange).toHaveBeenCalledWith('topic')
  })
})

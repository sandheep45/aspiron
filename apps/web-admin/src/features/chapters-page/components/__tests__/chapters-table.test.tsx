import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChaptersTable } from '@/features/chapters-page/components/chapters-table'

const defaultChapters = [
  {
    id: 'ch-1',
    name: 'Mechanics',
    published_topics: 12 as unknown as bigint,
    total_topics: 15 as unknown as bigint,
    coverage: 80,
    avg_recall: 'strong' as const,
    practice_accuracy: 74,
    status: 'healthy' as const,
    last_updated: '2 days ago',
  },
  {
    id: 'ch-2',
    name: 'Thermodynamics',
    published_topics: 5 as unknown as bigint,
    total_topics: 10 as unknown as bigint,
    coverage: 50,
    avg_recall: 'medium' as const,
    practice_accuracy: 62,
    status: 'needs_attention' as const,
    last_updated: '5 days ago',
  },
]

const defaultProps = {
  chapters: defaultChapters,
  search: '',
  sortBy: 'coverage',
  sortOrder: 'desc' as const,
  page: 1,
  limit: 10,
  totalFiltered: 2,
  onSearchChange: vi.fn(),
  onSortByChange: vi.fn(),
  onSortOrderChange: vi.fn(),
  onPageChange: vi.fn(),
  onViewChapter: vi.fn(),
}

describe('ChaptersTable', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders table with chapters', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('Mechanics')).toBeInTheDocument()
    expect(screen.getByText('Thermodynamics')).toBeInTheDocument()
  })

  it('renders progress bars with coverage values', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders recall badges', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Needs Attention')).toBeInTheDocument()
  })

  it('renders practice accuracy', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('74%')).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
  })

  it('renders topic counts', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('12 / 15 published')).toBeInTheDocument()
    expect(screen.getByText('5 / 10 published')).toBeInTheDocument()
  })

  it('renders last updated text', () => {
    render(<ChaptersTable {...defaultProps} />)
    expect(screen.getByText('2 days ago')).toBeInTheDocument()
    expect(screen.getByText('5 days ago')).toBeInTheDocument()
  })

  it('renders View Topics buttons', () => {
    render(<ChaptersTable {...defaultProps} />)
    const viewButtons = screen.getAllByRole('button', { name: /view topics/i })
    expect(viewButtons).toHaveLength(2)
  })

  it('calls onViewChapter when View Topics is clicked', async () => {
    const user = userEvent.setup()
    const onViewChapter = vi.fn()
    render(<ChaptersTable {...defaultProps} onViewChapter={onViewChapter} />)
    await user.click(screen.getAllByRole('button', { name: /view topics/i })[0])
    expect(onViewChapter).toHaveBeenCalledWith('ch-1')
  })

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(<ChaptersTable {...defaultProps} onSearchChange={onSearchChange} />)
    await user.type(screen.getByPlaceholderText('Search chapters...'), 'mech')
    expect(onSearchChange).toHaveBeenCalledTimes(4)
    expect(onSearchChange).toHaveBeenCalledWith('m')
  })

  it('calls onSortByChange when sort select changes', async () => {
    const user = userEvent.setup()
    const onSortByChange = vi.fn()
    render(<ChaptersTable {...defaultProps} onSortByChange={onSortByChange} />)
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    await user.click(screen.getByText('Recall'))
    expect(onSortByChange).toHaveBeenCalledWith('recall', expect.anything())
  })

  it('calls onSortOrderChange when sort direction button is clicked', async () => {
    const user = userEvent.setup()
    const onSortOrderChange = vi.fn()
    render(
      <ChaptersTable {...defaultProps} onSortOrderChange={onSortOrderChange} />,
    )
    await user.click(screen.getByRole('button', { name: '↓' }))
    expect(onSortOrderChange).toHaveBeenCalledTimes(1)
  })

  it('renders pagination info', () => {
    render(<ChaptersTable {...defaultProps} page={2} totalFiltered={25} />)
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument()
  })

  it('disables Previous on first page', () => {
    render(<ChaptersTable {...defaultProps} page={1} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables Next on last page', () => {
    render(<ChaptersTable {...defaultProps} page={1} totalFiltered={2} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('enables pagination buttons on middle pages', () => {
    render(<ChaptersTable {...defaultProps} page={2} totalFiltered={25} />)
    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('calls onPageChange for Previous', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <ChaptersTable
        {...defaultProps}
        page={3}
        totalFiltered={30}
        onPageChange={onPageChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /previous/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange for Next', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <ChaptersTable
        {...defaultProps}
        page={1}
        totalFiltered={30}
        onPageChange={onPageChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('renders EmptyState when no chapters', () => {
    render(<ChaptersTable {...defaultProps} chapters={[]} search='' />)
    expect(screen.getByText('No chapters found')).toBeInTheDocument()
    expect(
      screen.getByText('No chapters have been created for this subject.'),
    ).toBeInTheDocument()
  })

  it('shows search-specific empty message', () => {
    render(<ChaptersTable {...defaultProps} chapters={[]} search='xyz' />)
    expect(screen.getByText('No chapters found')).toBeInTheDocument()
    expect(
      screen.getByText('Try adjusting your search query.'),
    ).toBeInTheDocument()
  })

  it('rounds practice accuracy', () => {
    const chapters = [
      {
        ...defaultChapters[0],
        practice_accuracy: 74.7,
      },
    ]
    render(
      <ChaptersTable {...defaultProps} chapters={chapters} totalFiltered={1} />,
    )
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})

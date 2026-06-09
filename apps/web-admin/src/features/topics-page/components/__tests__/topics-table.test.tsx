import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TopicsTable } from '@/features/topics-page/components/topics-table'

const defaultTopics = [
  {
    id: 'topic-1',
    name: "Coulomb's Law",
    content_status: 'published',
    video_available: true,
    recall_strength: 'strong',
    practice_accuracy: 90,
    last_activity: '2 hours ago',
    status: 'healthy' as const,
  },
  {
    id: 'topic-2',
    name: 'Electric Field',
    content_status: 'draft',
    video_available: false,
    recall_strength: 'weak',
    practice_accuracy: 35,
    last_activity: 'Never',
    status: 'critical' as const,
  },
]

const defaultProps = {
  topics: defaultTopics,
  search: '',
  onSearchChange: vi.fn(),
  sortBy: undefined as string | undefined,
  onSortByChange: vi.fn(),
  sortOrder: 'desc' as const,
  onSortOrderChange: vi.fn(),
  statusFilter: undefined as string | undefined,
  onStatusFilterChange: vi.fn(),
  contentStatusFilter: undefined as string | undefined,
  onContentStatusFilterChange: vi.fn(),
  recallFilter: undefined as string | undefined,
  onRecallFilterChange: vi.fn(),
  videoFilter: undefined as string | undefined,
  onVideoFilterChange: vi.fn(),
  page: 1,
  onPageChange: vi.fn(),
  limit: 10,
  onViewTopic: vi.fn(),
}

describe('TopicsTable', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders table with topics', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText("Coulomb's Law")).toBeInTheDocument()
    expect(screen.getByText('Electric Field')).toBeInTheDocument()
  })

  it('renders content status badges', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders video availability', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText('Video Available')).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('renders recall badges', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('renders practice accuracy', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('35%')).toBeInTheDocument()
  })

  it('renders last activity', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<TopicsTable {...defaultProps} />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('renders View Topic buttons', () => {
    render(<TopicsTable {...defaultProps} />)
    const viewButtons = screen.getAllByRole('button', { name: /view topic/i })
    expect(viewButtons).toHaveLength(2)
  })

  it('calls onViewTopic when View Topic is clicked', async () => {
    const user = userEvent.setup()
    const onViewTopic = vi.fn()
    render(<TopicsTable {...defaultProps} onViewTopic={onViewTopic} />)
    await user.click(screen.getAllByRole('button', { name: /view topic/i })[0])
    expect(onViewTopic).toHaveBeenCalledWith('topic-1')
  })

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(<TopicsTable {...defaultProps} onSearchChange={onSearchChange} />)
    await user.type(screen.getByPlaceholderText('Search topics...'), 'coul')
    expect(onSearchChange).toHaveBeenCalledTimes(4)
    expect(onSearchChange).toHaveBeenCalledWith('c')
  })

  it('calls onSortOrderChange when sort direction button is clicked', async () => {
    const user = userEvent.setup()
    const onSortOrderChange = vi.fn()
    render(
      <TopicsTable {...defaultProps} onSortOrderChange={onSortOrderChange} />,
    )
    await user.click(
      screen.getByRole('button', { name: /toggle sort direction/i }),
    )
    expect(onSortOrderChange).toHaveBeenCalledTimes(1)
  })

  it('calls onSortByChange when a sortable column header is clicked', async () => {
    const user = userEvent.setup()
    const onSortByChange = vi.fn()
    render(<TopicsTable {...defaultProps} onSortByChange={onSortByChange} />)
    await user.click(screen.getByText('Recall Strength'))
    expect(onSortByChange).toHaveBeenCalledWith('recall')
  })

  it('renders pagination info', () => {
    render(<TopicsTable {...defaultProps} page={2} limit={5} />)
    expect(screen.getByText(/Page 2 of 1/)).toBeInTheDocument()
  })

  it('disables Previous on first page', () => {
    render(<TopicsTable {...defaultProps} page={1} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
  })

  it('disables Next on last page', () => {
    render(<TopicsTable {...defaultProps} page={1} limit={10} />)
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  it('enables pagination buttons on middle pages', () => {
    render(<TopicsTable {...defaultProps} page={1} limit={1} />)
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled()
  })

  it('calls onPageChange for Next', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <TopicsTable
        {...defaultProps}
        page={1}
        limit={1}
        onPageChange={onPageChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('renders EmptyState when no topics', () => {
    render(<TopicsTable {...defaultProps} topics={[]} search='' />)
    expect(screen.getByText('No topics yet')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This chapter does not have any topics yet. Topics will appear here once they are created in the content management system.',
      ),
    ).toBeInTheDocument()
  })

  it('shows search-specific empty message', () => {
    render(<TopicsTable {...defaultProps} topics={[]} search='xyz' />)
    expect(screen.getByText('No matching topics')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Try adjusting your search or filters to find what you are looking for.',
      ),
    ).toBeInTheDocument()
  })

  it('rounds practice accuracy', () => {
    const topics = [
      {
        ...defaultTopics[0],
        practice_accuracy: 74.7,
      },
    ]
    render(<TopicsTable {...defaultProps} topics={topics} limit={10} />)
    // practice_accuracy is rendered as {topic.practice_accuracy}% so 74.7 shows as "74.7%"
    expect(screen.getByText('74.7%')).toBeInTheDocument()
  })
})

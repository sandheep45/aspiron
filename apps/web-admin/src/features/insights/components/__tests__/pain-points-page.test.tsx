import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PainPointsPage } from '@/features/insights/components/pain-points-page'

const { mockUseTopicPerformanceQuery } = vi.hoisted(() => ({
  mockUseTopicPerformanceQuery: vi.fn(),
}))

vi.mock('@aspiron/tanstack-client', () => ({
  useTopicPerformanceQuery: mockUseTopicPerformanceQuery,
}))

vi.mock('@tanstack/react-table', () => ({
  flexRender: (cell: { header: () => string }) => cell.header(),
  getCoreRowModel: () => vi.fn(),
  getSortedRowModel: () => vi.fn(),
  useReactTable: ({
    getRowModel,
  }: {
    getRowModel: () => { rows: Record<string, unknown>[] }
  }) => {
    const rowModel = getRowModel()
    return {
      getHeaderGroups: () => [{ id: 'header-1', headers: [] }],
      getRowModel: () => rowModel,
      getAllColumns: () => [],
    }
  },
}))

vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({
    _columns,
    data,
    getRowProps,
  }: {
    columns: Record<string, unknown>[]
    data: Record<string, unknown>[]
    getRowProps?: (row: Record<string, unknown>) => Record<string, unknown>
  }) => (
    <table data-testid='data-table'>
      <tbody>
        {data.map((row, i) => (
          <tr
            key={i}
            data-testid='pain-point-row'
            {...(getRowProps ? getRowProps(row) : {})}
          >
            <td>{String(row.topic_name)}</td>
            <td>{String(row.practice_accuracy)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}))

const successData = {
  topics: [
    {
      topic_id: '1',
      topic_name: 'Quadratic Equations',
      chapter_name: 'Algebra',
      subject_name: 'Mathematics',
      recall_strength_mcq: 0.65,
      recall_strength_reflection: 0.55,
      practice_accuracy: 0.32,
      students_affected: 18n,
      total_students: 30n,
    },
    {
      topic_id: '2',
      topic_name: 'Photosynthesis',
      chapter_name: 'Biology',
      subject_name: 'Science',
      recall_strength_mcq: 0.45,
      recall_strength_reflection: 0.4,
      practice_accuracy: 0.45,
      students_affected: 14n,
      total_students: 30n,
    },
    {
      topic_id: '3',
      topic_name: "Newton's Laws",
      chapter_name: 'Physics',
      subject_name: 'Science',
      recall_strength_mcq: null,
      recall_strength_reflection: null,
      practice_accuracy: 0.52,
      students_affected: 10n,
      total_students: 30n,
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 3n,
    filtered_total: 3n,
    total_pages: 1,
  },
}

describe('PainPointsPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders heading', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<PainPointsPage />)
    expect(screen.getByText('Student Pain Points')).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    const { container } = render(<PainPointsPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders error state with retry that refetches', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load topic data'),
      refetch,
    })
    render(<PainPointsPage />)
    expect(screen.getByText('Failed to load topic data')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no topics', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: { ...successData, topics: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<PainPointsPage />)
    expect(screen.getByText('No topic data found')).toBeInTheDocument()
  })

  it('renders topic rows', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<PainPointsPage />)
    const rows = screen.getAllByTestId('pain-point-row')
    expect(rows).toHaveLength(3)
  })

  it('shows pagination info', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: successData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<PainPointsPage />)
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
  })

  it('handles null data gracefully', () => {
    mockUseTopicPerformanceQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })
    render(<PainPointsPage />)
    expect(screen.getByText('No topic data found')).toBeInTheDocument()
  })
})

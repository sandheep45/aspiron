import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TopicDetailDrawer } from './topic-detail-drawer'

const mockData = {
  topic: 'Quadratic Equations',
  accuracy: 0.32,
  students_affected: 18 as unknown as bigint,
  trend: 'degrading',
  common_mistakes: [
    'Incorrect application of quadratic formula',
    'Sign errors in discriminant calculation',
  ],
  weak_questions: ['Solve 2x² + 5x - 3 = 0', 'Find roots of x² - 7x + 12 = 0'],
  recommendations: [
    'Review quadratic formula derivation',
    'Practice discriminant analysis',
    'Complete remedial worksheet set 3',
  ],
}

describe('TopicDetailDrawer', () => {
  it('shows skeleton while loading', () => {
    render(<TopicDetailDrawer open onOpenChange={vi.fn()} isLoading />)
    const skeleton = document.body.querySelector('[data-slot="skeleton"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders topic name when data is provided', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('Quadratic Equations')).toBeInTheDocument()
    expect(screen.getByText('Topic Performance Details')).toBeInTheDocument()
  })

  it('renders accuracy percentage', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('32%')).toBeInTheDocument()
  })

  it('renders students affected count', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('18')).toBeInTheDocument()
  })

  it('renders trend badge', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('degrading')).toBeInTheDocument()
  })

  it('renders common mistakes section', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('Common Mistakes')).toBeInTheDocument()
    expect(
      screen.getByText('Incorrect application of quadratic formula'),
    ).toBeInTheDocument()
  })

  it('renders weak questions section', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('Weak Questions')).toBeInTheDocument()
  })

  it('renders recommendations section', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={mockData}
        isLoading={false}
      />,
    )
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
    expect(
      screen.getByText('Review quadratic formula derivation'),
    ).toBeInTheDocument()
  })

  it('calls onOpenChange when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <TopicDetailDrawer
        open
        onOpenChange={onOpenChange}
        data={mockData}
        isLoading={false}
      />,
    )
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    expect(onOpenChange).toHaveBeenCalled()
  })

  it('renders nothing when closed and no data', () => {
    const { container } = render(
      <TopicDetailDrawer
        open={false}
        onOpenChange={vi.fn()}
        isLoading={false}
      />,
    )
    expect(container.textContent).toBe('')
  })

  it('renders empty text for empty sections', () => {
    render(
      <TopicDetailDrawer
        open
        onOpenChange={vi.fn()}
        data={{
          ...mockData,
          common_mistakes: [],
          weak_questions: [],
          recommendations: [],
        }}
        isLoading={false}
      />,
    )
    expect(screen.getByText('No common mistakes recorded')).toBeInTheDocument()
    expect(screen.getByText('No weak questions identified')).toBeInTheDocument()
    expect(screen.getByText('No recommendations available')).toBeInTheDocument()
  })
})

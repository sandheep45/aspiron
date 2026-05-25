import { render, screen } from '@testing-library/react'
import { InsightCard } from '@/features/dashboard/components/insight-card'
import { dashboardQuickActionRouteMapper } from '@/features/dashboard/utils'

vi.mock('@aspiron/tanstack-client', () => ({
  useGetTopicByIdQuery: () => ({
    data: {
      id: 'topic-1',
      name: 'Test Topic',
      chapter_id: 'ch-1',
      order_number: 1,
    },
    isLoading: false,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const baseInsight = {
  id: '1',
  severity: 'danger' as const,
  title: 'Test Insight',
  description: 'Test description',
  metadata: { quiz_id: 'quiz-1', count: 5 },
  detected_at: new Date('2025-01-15T10:00:00Z'),
}

describe('InsightCard', () => {
  it('renders title and description', () => {
    render(
      <InsightCard
        insight={{ ...baseInsight, insight_type: 'quiz_review_pending' }}
      />,
    )
    expect(screen.getByText('Test Insight')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders metadata value in action button for quiz_review_pending', () => {
    const insight = {
      ...baseInsight,
      insight_type: 'quiz_review_pending' as const,
      metadata: { quiz_id: 'quiz-1', pending_count: 5 },
    }
    render(<InsightCard insight={insight} />)
    expect(screen.getByText('quiz-1')).toBeInTheDocument()
  })

  it('renders the correct icon for the insight type', () => {
    const _iconLabel =
      dashboardQuickActionRouteMapper.quiz_review_pending.icon.name
    render(
      <InsightCard
        insight={{ ...baseInsight, insight_type: 'quiz_review_pending' }}
      />,
    )
    expect(screen.getByText('Test Insight')).toBeInTheDocument()
  })

  it('renders topic_difficulty with link button', () => {
    const insight = {
      ...baseInsight,
      insight_type: 'topic_difficulty' as const,
      metadata: { topic_id: 'topic-1', avg_progress: 45, attempt_count: 10 },
    }
    render(<InsightCard insight={insight} />)
    expect(screen.getByText('Test Topic')).toBeInTheDocument()
  })

  it('renders low_attendance with action button', () => {
    const insight = {
      ...baseInsight,
      insight_type: 'low_attendance' as const,
      metadata: {
        session_id: 'session-1',
        topic_id: 'topic-1',
        attendee_count: 30,
      },
    }
    render(<InsightCard insight={insight} />)
    expect(screen.getByText('session-1')).toBeInTheDocument()
  })

  it('renders low_engagement with action button', () => {
    const insight = {
      ...baseInsight,
      insight_type: 'low_engagement' as const,
      metadata: { topic_id: 'topic-1', active_users: 15 },
    }
    render(<InsightCard insight={insight} />)
    expect(screen.getByText('topic-1')).toBeInTheDocument()
  })

  it('renders with warning severity', () => {
    const insight = {
      ...baseInsight,
      severity: 'warning' as const,
      insight_type: 'quiz_review_pending' as const,
      metadata: { quiz_id: 'q-1' },
    }
    render(<InsightCard insight={insight} />)
    expect(screen.getByText('Test Insight')).toBeInTheDocument()
  })

  it('renders with info severity', () => {
    const insight = {
      ...baseInsight,
      severity: 'info' as const,
      insight_type: 'quiz_review_pending' as const,
      metadata: { quiz_id: 'q-1' },
    }
    render(<InsightCard insight={insight} />)
    expect(screen.getByText('Test Insight')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActionRequired } from '@/features/dashboard/components/action-required'

vi.mock('@aspiron/tanstack-client', () => ({
  useInsightQuery: () => ({
    data: {
      time_window: {
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-31T00:00:00Z',
      },
      insights: [
        {
          id: '1',
          insight_type: 'quiz_review_pending',
          severity: 'danger',
          title: 'Quizzes Pending Review',
          description: '5 quizzes need your attention',
          metadata: { quiz_id: 'quiz-1', count: 5 },
          detected_at: new Date('2025-01-15T10:00:00Z'),
        },
        {
          id: '2',
          insight_type: 'low_attendance',
          severity: 'warning',
          title: 'Low Attendance',
          description: 'Class attendance dropped to 60%',
          metadata: { session_id: 'session-1', attendance_rate: 60 },
          detected_at: new Date('2025-01-15T11:00:00Z'),
        },
        {
          id: '3',
          insight_type: 'low_engagement',
          severity: 'info',
          title: 'Low Engagement',
          description: 'Students not completing assignments',
          metadata: { topic_id: 'topic-1', engagement_rate: 45 },
          detected_at: new Date('2025-01-15T12:00:00Z'),
        },
      ],
      summary: {
        total: 3,
        filtered_item: null,
        filtered_item_count: 0,
        danger: 1,
        success: 0,
        neutral: 0,
        warning: 1,
        info: 1,
      },
      pagination: { page: 1, limit: 10, total: 3 },
    },
    isLoading: false,
    error: null,
  }),
  useGetTopicByIdQuery: () => ({
    data: null,
    isLoading: false,
  }),
}))

describe('ActionRequired', () => {
  it('renders section heading', () => {
    render(<ActionRequired />)
    expect(screen.getByText('Action Required')).toBeInTheDocument()
  })

  it('renders insight cards from mocked data', () => {
    render(<ActionRequired />)
    expect(screen.getByText('Quizzes Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Low Attendance')).toBeInTheDocument()
    expect(screen.getByText('Low Engagement')).toBeInTheDocument()
  })

  it('renders insight descriptions', () => {
    render(<ActionRequired />)
    expect(
      screen.getByText('5 quizzes need your attention'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Class attendance dropped to 60%'),
    ).toBeInTheDocument()
  })
})

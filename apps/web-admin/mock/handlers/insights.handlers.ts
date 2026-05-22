import type {
  Insight,
  InsightSummary,
  InsightsResponse,
} from '@aspiron/api-client'
import { HttpResponse, http } from 'msw'

function buildInsight(overrides?: Partial<Insight>): Insight {
  return {
    id: 'insight-1',
    insight_type: 'quiz_review_pending',
    severity: 'danger',
    title: 'Quizzes Pending Review',
    description: '5 quizzes need your attention',
    metadata: { quiz_id: 'quiz-1', count: 5 },
    detected_at: new Date('2025-01-15T10:00:00Z'),
    ...overrides,
  }
}

export const insightsHandlers = [
  http.get('*/api/v1/admin/insights', ({ request }) => {
    const url = new URL(request.url)
    const type = url.searchParams.get('insight_type')
    const insights = type
      ? [buildInsight({ insight_type: type as Insight['insight_type'] })]
      : [
          buildInsight({
            id: '1',
            insight_type: 'quiz_review_pending',
            severity: 'danger',
            title: 'Quizzes Pending Review',
          }),
          buildInsight({
            id: '2',
            insight_type: 'low_attendance',
            severity: 'warning',
            title: 'Low Attendance',
            description: 'Class attendance dropped to 60%',
            metadata: { session_id: 'session-1', attendance_rate: 60 },
          }),
          buildInsight({
            id: '3',
            insight_type: 'low_engagement',
            severity: 'info',
            title: 'Low Engagement',
            description: 'Students not completing assignments',
            metadata: { topic_id: 'topic-1', engagement_rate: 45 },
          }),
        ]

    const summary: InsightSummary = {
      total: insights.length,
      filtered_item: null,
      filtered_item_count: 0,
      danger: insights.filter((i) => i.severity === 'danger').length,
      success: insights.filter((i) => i.severity === 'success').length,
      neutral: insights.filter((i) => i.severity === 'neutral').length,
      warning: insights.filter((i) => i.severity === 'warning').length,
      info: insights.filter((i) => i.severity === 'info').length,
    }

    const response: InsightsResponse = {
      time_window: {
        start: '2025-01-01T00:00:00Z',
        end: '2025-01-31T00:00:00Z',
      },
      insights,
      summary,
      pagination: {
        page: 1,
        limit: 10,
        total: insights.length as unknown as bigint,
        filtered_total: insights.length as unknown as bigint,
        total_pages: 1,
      },
    }

    return HttpResponse.json(response)
  }),
]

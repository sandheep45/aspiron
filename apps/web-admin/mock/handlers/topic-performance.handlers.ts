import type {
  TopicPerformance,
  TopicPerformanceResponse,
} from '@aspiron/api-client'
import { HttpResponse, http } from 'msw'

function buildTopicPerformance(
  overrides?: Partial<TopicPerformance>,
): TopicPerformance {
  return {
    topic_id: 'topic-1',
    topic_name: 'Quadratic Equations',
    chapter_name: 'Algebra',
    subject_name: 'Mathematics',
    recall_strength_mcq: 0.65,
    recall_strength_reflection: 0.55,
    practice_accuracy: 0.48,
    students_affected: 12 as unknown as bigint,
    total_students: 30 as unknown as bigint,
    ...overrides,
  }
}

export const topicPerformanceHandlers = [
  http.get('*/api/v1/admin/insights/topics', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    const sortBy = url.searchParams.get('sort_by')

    const topics = [
      buildTopicPerformance({
        topic_id: '1',
        topic_name: 'Quadratic Equations',
        chapter_name: 'Algebra',
        subject_name: 'Mathematics',
        practice_accuracy: 0.32,
        students_affected: 18 as unknown as bigint,
      }),
      buildTopicPerformance({
        topic_id: '2',
        topic_name: 'Photosynthesis',
        chapter_name: 'Plant Biology',
        subject_name: 'Biology',
        practice_accuracy: 0.45,
        students_affected: 14 as unknown as bigint,
      }),
      buildTopicPerformance({
        topic_id: '3',
        topic_name: "Newton's Laws",
        chapter_name: 'Mechanics',
        subject_name: 'Physics',
        practice_accuracy: 0.52,
        students_affected: 10 as unknown as bigint,
      }),
      buildTopicPerformance({
        topic_id: '4',
        topic_name: 'Chemical Bonding',
        chapter_name: 'Basic Chemistry',
        subject_name: 'Chemistry',
        practice_accuracy: 0.61,
        students_affected: 8 as unknown as bigint,
      }),
      buildTopicPerformance({
        topic_id: '5',
        topic_name: 'Thermodynamics',
        chapter_name: 'Thermal Physics',
        subject_name: 'Physics',
        practice_accuracy: 0.73,
        students_affected: 5 as unknown as bigint,
      }),
    ]

    const sorted = [...topics]
    if (sortBy === 'practice_accuracy') {
      sorted.sort(
        (a, b) => Number(a.practice_accuracy) - Number(b.practice_accuracy),
      )
    }

    const start = (page - 1) * limit
    const paged = sorted.slice(start, start + limit)

    const response: TopicPerformanceResponse = {
      topics: paged,
      pagination: {
        page,
        limit,
        total: topics.length as unknown as bigint,
        filtered_total: topics.length as unknown as bigint,
        total_pages: Math.ceil(topics.length / limit),
      },
    }

    return HttpResponse.json(response)
  }),
]

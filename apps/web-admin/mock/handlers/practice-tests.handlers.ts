import type {
  CreateQuestionResponse,
  CreateTestResponse,
  PracticeSignal,
  QuestionItem,
  QuestionsResponse,
  TestAnalytics,
  TopicTestItem,
} from '@aspiron/api-client'
import { HttpResponse, http } from 'msw'

let idCounter = 1

function nextId(): string {
  const id = `q-${String(idCounter).padStart(4, '0')}`
  idCounter++
  return id
}

function buildQuestionItem(overrides?: Partial<QuestionItem>): QuestionItem {
  const id = nextId()
  return {
    id,
    identifier: `Q-${id}`,
    question: 'What is the derivative of x²?',
    question_type: 'MCQ',
    difficulty: 'Medium',
    correct_rate: 75,
    status: 'Active',
    ...overrides,
  }
}

function _buildQuestionsResponse(
  overrides?: Partial<QuestionsResponse>,
): QuestionsResponse {
  return {
    items: [
      buildQuestionItem({ id: 'q-0001', identifier: 'Q-0001' }),
      buildQuestionItem({
        id: 'q-0002',
        identifier: 'Q-0002',
        difficulty: 'Easy',
      }),
      buildQuestionItem({
        id: 'q-0003',
        identifier: 'Q-0003',
        difficulty: 'Hard',
      }),
    ],
    total: 3,
    page: 1,
    limit: 10,
    total_pages: 1,
    ...overrides,
  }
}

function buildCreateQuestionResponse(
  overrides?: Partial<CreateQuestionResponse>,
): CreateQuestionResponse {
  const id = nextId()
  return {
    id,
    identifier: `Q-${id}`,
    ...overrides,
  }
}

function buildTopicTestItem(overrides?: Partial<TopicTestItem>): TopicTestItem {
  return {
    id: nextId(),
    title: 'Quadratic Equations Assessment',
    status: 'Published',
    questions_count: 10,
    difficulty_mix: 'Balanced',
    average_score: 72.5,
    attempts: 15,
    ...overrides,
  }
}

function buildCreateTestResponse(
  overrides?: Partial<CreateTestResponse>,
): CreateTestResponse {
  return {
    id: nextId(),
    title: 'Quadratic Equations Assessment',
    questions_count: 10,
    ...overrides,
  }
}

function buildPracticeSignal(
  overrides?: Partial<PracticeSignal>,
): PracticeSignal {
  return {
    id: 'high-accuracy',
    message: 'Students are performing well with high accuracy',
    signal_type: 'positive',
    ...overrides,
  }
}

function buildTestAnalytics(overrides?: Partial<TestAnalytics>): TestAnalytics {
  return {
    average_score_trend: [
      { date: '2026-06-01', value: 65.0 },
      { date: '2026-06-08', value: 72.0 },
      { date: '2026-06-15', value: 78.0 },
    ],
    attempts_trend: [
      { date: '2026-06-01', value: 5 },
      { date: '2026-06-08', value: 8 },
      { date: '2026-06-15', value: 12 },
    ],
    difficulty_distribution: [
      { difficulty: 'Easy', count: 3, percentage: 30.0 },
      { difficulty: 'Medium', count: 5, percentage: 50.0 },
      { difficulty: 'Hard', count: 2, percentage: 20.0 },
    ],
    question_performance: [
      {
        question_id: 'q-0001',
        question: 'What is 2+2?',
        correct_rate: 85.0,
        attempts: 20,
      },
      {
        question_id: 'q-0002',
        question: 'Solve for x: x² - 4 = 0',
        correct_rate: 62.0,
        attempts: 18,
      },
    ],
    ...overrides,
  }
}

export const practiceTestsHandlers = [
  http.get('*/api/v1/topics/:topicId/practice/overview', () => {
    return HttpResponse.json({
      total_questions: 15,
      average_accuracy: 72.5,
      total_tests: 3,
      last_test_conducted: '2 days ago',
    })
  }),

  http.get('*/api/v1/topics/:topicId/practice/questions', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10

    const allItems = [
      buildQuestionItem({
        id: 'q-0001',
        identifier: 'Q-0001',
        question: 'What is the derivative of x²?',
      }),
      buildQuestionItem({
        id: 'q-0002',
        identifier: 'Q-0002',
        difficulty: 'Easy',
        question: 'What is 2+2?',
      }),
      buildQuestionItem({
        id: 'q-0003',
        identifier: 'Q-0003',
        difficulty: 'Hard',
        question: 'Solve integral of sin(x) dx',
      }),
      buildQuestionItem({
        id: 'q-0004',
        identifier: 'Q-0004',
        question_type: 'Numerical',
        question: 'Calculate the area of a circle with radius 5',
      }),
      buildQuestionItem({
        id: 'q-0005',
        identifier: 'Q-0005',
        difficulty: 'Easy',
        question: 'What is the capital of France?',
      }),
    ]

    const filtered = search
      ? allItems.filter((item) =>
          item.question.toLowerCase().includes(search.toLowerCase()),
        )
      : allItems

    const start = (page - 1) * limit
    const items = filtered.slice(start, start + limit)

    return HttpResponse.json({
      items,
      total: filtered.length,
      page,
      limit,
      total_pages: Math.ceil(filtered.length / limit),
    })
  }),

  http.post('*/api/v1/topics/:topicId/practice/questions', () => {
    return HttpResponse.json(buildCreateQuestionResponse(), { status: 201 })
  }),

  http.get('*/api/v1/topics/:topicId/practice/tests', () => {
    return HttpResponse.json([
      buildTopicTestItem({ id: 'test-001' }),
      buildTopicTestItem({
        id: 'test-002',
        title: 'Algebra Fundamentals',
        average_score: null,
      }),
    ])
  }),

  http.post('*/api/v1/topics/:topicId/practice/tests', () => {
    return HttpResponse.json(buildCreateTestResponse(), { status: 201 })
  }),

  http.get('*/api/v1/topics/:topicId/practice/signals', () => {
    return HttpResponse.json([
      buildPracticeSignal({
        id: 'high-accuracy',
        signal_type: 'positive',
        message: 'Students perform well with high accuracy',
      }),
      buildPracticeSignal({
        id: 'moderate-engagement',
        signal_type: 'warning',
        message: 'Engagement is moderate — consider adding variety',
      }),
      buildPracticeSignal({
        id: 'low-coverage',
        signal_type: 'negative',
        message: 'Topic coverage is below expected threshold',
      }),
      buildPracticeSignal({
        id: 'application-based',
        signal_type: 'info',
        message: 'Include more application-based questions',
      }),
    ])
  }),

  http.get('*/api/v1/topics/:topicId/practice/analytics', ({ request }) => {
    const url = new URL(request.url)
    const empty = url.searchParams.get('empty')
    if (empty === 'true') {
      return HttpResponse.json(null)
    }
    return HttpResponse.json(buildTestAnalytics())
  }),
]

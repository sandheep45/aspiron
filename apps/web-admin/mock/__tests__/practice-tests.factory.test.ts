import { server } from '@mock/server'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

const TOPIC_ID = 'test-topic'

describe('practice tests MSW handlers', () => {
  it('GET practice/overview returns expected shape', async () => {
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/overview`)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('total_questions')
    expect(body).toHaveProperty('average_accuracy')
    expect(body).toHaveProperty('total_tests')
    expect(body).toHaveProperty('last_test_conducted')
    expect(typeof body.total_questions).toBe('number')
    expect(typeof body.average_accuracy).toBe('number')
  })

  it('GET practice/questions returns paginated response', async () => {
    const response = await fetch(
      `/api/v1/topics/${TOPIC_ID}/practice/questions`,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('items')
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('page')
    expect(body).toHaveProperty('limit')
    expect(body).toHaveProperty('total_pages')
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.page).toBeGreaterThanOrEqual(1)
  })

  it('GET practice/questions supports search param', async () => {
    const response = await fetch(
      `/api/v1/topics/${TOPIC_ID}/practice/questions?search=derivative`,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items.length).toBeGreaterThanOrEqual(1)
    expect(body.total).toBeLessThanOrEqual(5)
  })

  it('GET practice/questions supports pagination', async () => {
    const response = await fetch(
      `/api/v1/topics/${TOPIC_ID}/practice/questions?page=1&limit=2`,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.items.length).toBeLessThanOrEqual(2)
    expect(body.limit).toBe(2)
  })

  it('POST practice/questions returns create response', async () => {
    const response = await fetch(
      `/api/v1/topics/${TOPIC_ID}/practice/questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Test question',
          question_type: 'MCQ',
        }),
      },
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('identifier')
    expect(body.identifier).toMatch(/^Q-q-\d{4}$/)
  })

  it('GET practice/tests returns array', async () => {
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/tests`)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThanOrEqual(1)
    const testItem = body[0]
    expect(testItem).toHaveProperty('id')
    expect(testItem).toHaveProperty('title')
    expect(testItem).toHaveProperty('status')
    expect(testItem).toHaveProperty('questions_count')
    expect(testItem).toHaveProperty('difficulty_mix')
  })

  it('POST practice/tests returns create response', async () => {
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test', question_ids: ['q-1'] }),
    })
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('title')
    expect(body).toHaveProperty('questions_count')
  })

  it('GET practice/signals returns signal array', async () => {
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/signals`)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThanOrEqual(3)
    const signal = body[0]
    expect(signal).toHaveProperty('id')
    expect(signal).toHaveProperty('message')
    expect(signal).toHaveProperty('signal_type')
  })

  it('GET practice/signals returns all signal types', async () => {
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/signals`)
    const body = await response.json()
    const types = body.map((s: { signal_type: string }) => s.signal_type)
    expect(types).toContain('positive')
    expect(types).toContain('warning')
    expect(types).toContain('negative')
    expect(types).toContain('info')
  })

  it('GET practice/analytics returns analytics shape', async () => {
    const response = await fetch(
      `/api/v1/topics/${TOPIC_ID}/practice/analytics`,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('average_score_trend')
    expect(body).toHaveProperty('attempts_trend')
    expect(body).toHaveProperty('difficulty_distribution')
    expect(body).toHaveProperty('question_performance')
    expect(Array.isArray(body.average_score_trend)).toBe(true)
    expect(Array.isArray(body.difficulty_distribution)).toBe(true)
  })

  it('GET practice/analytics?empty=true returns null', async () => {
    const response = await fetch(
      `/api/v1/topics/${TOPIC_ID}/practice/analytics?empty=true`,
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toBeNull()
  })

  it('can override practice overview per test', async () => {
    server.use(
      http.get('*/api/v1/topics/:topicId/practice/overview', () => {
        return HttpResponse.json({
          total_questions: 42,
          average_accuracy: 100,
          total_tests: 99,
          last_test_conducted: 'Override test',
        })
      }),
    )
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/overview`)
    const body = await response.json()
    expect(body.total_questions).toBe(42)
    expect(body.average_accuracy).toBe(100)
  })

  it('resets practice overview handler between tests', async () => {
    const response = await fetch(`/api/v1/topics/${TOPIC_ID}/practice/overview`)
    const body = await response.json()
    expect(body.total_questions).toBe(15)
  })
})

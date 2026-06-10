import { server } from '@mock/server'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'

describe('MSW', () => {
  it('intercepts health endpoint', async () => {
    const response = await fetch('/api/v1/health')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toEqual({ status: 'healthy', version: '0.1.0' })
  })

  it('allows per-test handler overrides', async () => {
    server.use(
      http.get('*/api/v1/health', () => {
        return HttpResponse.json({ status: 'degraded', version: '0.1.0' })
      }),
    )

    const response = await fetch('/api/v1/health')
    const body = await response.json()
    expect(body.status).toBe('degraded')
  })

  it('resets handlers between tests', async () => {
    const response = await fetch('/api/v1/health')
    const body = await response.json()
    expect(body.status).toBe('healthy')
  })

  it('intercepts auth me endpoint', async () => {
    const response = await fetch('/api/v1/auth/me')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty('user')
    expect(body.data).toHaveProperty('roles')
    expect(body.data).toHaveProperty('permissions')
  })

  it('intercepts insights endpoint', async () => {
    const response = await fetch('/api/v1/admin/insights')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('insights')
    expect(body).toHaveProperty('summary')
    expect(body).toHaveProperty('pagination')
    expect(Array.isArray(body.insights)).toBe(true)
  })

  it('intercepts topic by id endpoint', async () => {
    const response = await fetch('/api/v1/topics/topic-42')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.id).toBe('topic-42')
    expect(body).toHaveProperty('name')
  })

  it('intercepts content dashboard summary', async () => {
    const response = await fetch('/api/v1/content/dashboard/summary')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('subjects_covered')
    expect(body).toHaveProperty('topics_published')
    expect(body).toHaveProperty('topics_flagged')
  })

  it('intercepts content dashboard attention', async () => {
    const response = await fetch('/api/v1/content/dashboard/attention')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('total')
    expect(body).toHaveProperty('items')
    expect(Array.isArray(body.items)).toBe(true)
  })

  it('intercepts content dashboard subjects', async () => {
    const response = await fetch('/api/v1/content/dashboard/subjects')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('name')
      expect(body[0]).toHaveProperty('completion')
    }
  })

  it('intercepts content dashboard signals', async () => {
    const response = await fetch('/api/v1/content/dashboard/signals')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('highest_recall')
    expect(body).toHaveProperty('fastest_decay')
    expect(Array.isArray(body.highest_recall)).toBe(true)
    expect(Array.isArray(body.fastest_decay)).toBe(true)
  })

  it('intercepts subjects-page endpoint', async () => {
    const response = await fetch('/api/v1/content/subjects-page')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('intercepts subjects-page summary', async () => {
    const response = await fetch('/api/v1/content/subjects-page/summary')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('total_subjects')
    expect(body).toHaveProperty('descriptions')
  })

  it('intercepts subjects-page signals', async () => {
    const response = await fetch('/api/v1/content/subjects-page/signals')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('intercepts chapters-page summary', async () => {
    const response = await fetch(
      '/api/v1/subjects/subject-1/chapters-page/summary',
    )
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('subject_name')
    expect(body).toHaveProperty('total_chapters')
    expect(body).toHaveProperty('published_topics')
  })

  it('intercepts chapters-page chapters', async () => {
    const response = await fetch(
      '/api/v1/subjects/subject-1/chapters-page/chapters',
    )
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('name')
      expect(body[0]).toHaveProperty('coverage')
      expect(body[0]).toHaveProperty('status')
    }
  })

  it('intercepts chapters-page insights', async () => {
    const response = await fetch(
      '/api/v1/subjects/subject-1/chapters-page/insights',
    )
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('type')
      expect(body[0]).toHaveProperty('title')
      expect(body[0]).toHaveProperty('description')
    }
  })

  it('intercepts topics-page summary', async () => {
    const response = await fetch(
      '/api/v1/chapters/chapter-1/topics-page/summary',
    )
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('chapter_name')
    expect(body).toHaveProperty('total_topics')
    expect(body).toHaveProperty('published_topics')
  })

  it('intercepts topics-page topics', async () => {
    const response = await fetch(
      '/api/v1/chapters/chapter-1/topics-page/topics',
    )
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('name')
      expect(body[0]).toHaveProperty('content_status')
      expect(body[0]).toHaveProperty('video_available')
      expect(body[0]).toHaveProperty('status')
    }
  })

  it('intercepts topics-page insights', async () => {
    const response = await fetch(
      '/api/v1/chapters/chapter-1/topics-page/insights',
    )
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('type')
      expect(body[0]).toHaveProperty('title')
      expect(body[0]).toHaveProperty('description')
    }
  })

  // -----------------------------------------------------------------------
  // Topic Detail
  // -----------------------------------------------------------------------

  it('intercepts topic overview', async () => {
    const response = await fetch('/api/v1/topics/topic-1/overview')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('recall_strength')
    expect(body).toHaveProperty('practice_accuracy')
    expect(body).toHaveProperty('dropoff_indicator')
    expect(body).toHaveProperty('engagement_trend')
  })

  it('intercepts topic issues', async () => {
    const response = await fetch('/api/v1/topics/topic-1/issues')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('title')
      expect(body[0]).toHaveProperty('severity')
      expect(body[0]).toHaveProperty('description')
    }
  })

  it('intercepts topic components', async () => {
    const response = await fetch('/api/v1/topics/topic-1/components')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('name')
      expect(body[0]).toHaveProperty('status')
    }
  })

  it('intercepts topic actions', async () => {
    const response = await fetch('/api/v1/topics/topic-1/actions')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
    if (body.length > 0) {
      expect(body[0]).toHaveProperty('id')
      expect(body[0]).toHaveProperty('label')
      expect(body[0]).toHaveProperty('icon')
    }
  })

  it('intercepts topic trends', async () => {
    const response = await fetch('/api/v1/topics/topic-1/trends')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('recall_trend')
    expect(body).toHaveProperty('practice_accuracy_trend')
    expect(body).toHaveProperty('engagement_trend')
    expect(body).toHaveProperty('completion_trend')
  })

  it('returns 404 for unknown topic on all 5 endpoints', async () => {
    const endpoints = [
      '/api/v1/topics/unknown/overview',
      '/api/v1/topics/unknown/issues',
      '/api/v1/topics/unknown/components',
      '/api/v1/topics/unknown/actions',
      '/api/v1/topics/unknown/trends',
    ]
    for (const endpoint of endpoints) {
      const response = await fetch(endpoint)
      expect(response.status).toBe(404)
      const body = await response.json()
      expect(body.error.code).toBe('NOT_FOUND')
    }
  })

  it('allows per-test topic overview override', async () => {
    server.use(
      http.get('*/api/v1/topics/:topicId/overview', () => {
        return HttpResponse.json({
          recall_strength: 'strong',
          practice_accuracy: 95,
          dropoff_indicator: 'low',
          engagement_trend: 'growing',
        })
      }),
    )

    const response = await fetch('/api/v1/topics/custom/overview')
    const body = await response.json()
    expect(body.recall_strength).toBe('strong')
    expect(body.practice_accuracy).toBe(95)
  })

  it('resets topic overview handler between tests', async () => {
    const response = await fetch('/api/v1/topics/topic-1/overview')
    const body = await response.json()
    expect(body.recall_strength).toBeTruthy()
  })

  // ── Notes Manager endpoints ──────────────────────────────────────────────

  it('intercepts notes overview endpoint', async () => {
    const response = await fetch('/api/v1/topics/topic-1/notes/overview')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('teacher_notes_status')
    expect(body).toHaveProperty('ai_notes_status')
    expect(body).toHaveProperty('external_references_count')
    expect(body).toHaveProperty('student_engagement')
  })

  it('intercepts teacher notes endpoint', async () => {
    const response = await fetch('/api/v1/topics/topic-1/notes')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body).toHaveProperty('id')
    expect(body).toHaveProperty('content')
    expect(body).toHaveProperty('status')
  })

  it('intercepts ai-notes endpoint', async () => {
    const response = await fetch('/api/v1/topics/topic-1/ai-notes')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('intercepts references endpoint', async () => {
    const response = await fetch('/api/v1/topics/topic-1/references')
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('returns 404 for unknown topic notes', async () => {
    const response = await fetch('/api/v1/topics/unknown/notes/overview')
    expect(response.status).toBe(404)
  })

  it('returns 404 for unknown topic ai-notes', async () => {
    const response = await fetch('/api/v1/topics/unknown/ai-notes')
    expect(response.status).toBe(404)
  })

  it('returns 404 for unknown topic references', async () => {
    const response = await fetch('/api/v1/topics/unknown/references')
    expect(response.status).toBe(404)
  })
})

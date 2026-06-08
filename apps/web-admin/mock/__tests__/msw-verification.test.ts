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
})

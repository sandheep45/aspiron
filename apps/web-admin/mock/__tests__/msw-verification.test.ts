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
})

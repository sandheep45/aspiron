import { describe, expect, it } from 'vitest'
import { createTestSchema } from '@/features/create-test/schema'

describe('createTestSchema', () => {
  it('validates a valid test form', () => {
    const result = createTestSchema.safeParse({
      title: 'Quadratic Equations Assessment',
      description: 'Test description',
      instructions: 'Read carefully',
      duration_minutes: 30,
      passing_score: 40,
      max_attempts: 3,
      visibility: 'Visible',
      status: 'Draft',
    })
    expect(result.success).toBe(true)
  })

  it('validates with only required fields', () => {
    const result = createTestSchema.safeParse({
      title: 'Minimal Test',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = createTestSchema.safeParse({
      title: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title')
    }
  })

  it('rejects missing title', () => {
    const result = createTestSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title')
    }
  })

  it('rejects negative duration_minutes', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      duration_minutes: -5,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('duration_minutes')
    }
  })

  it('rejects duration_minutes of 0', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      duration_minutes: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects passing_score above 100', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      passing_score: 150,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('passing_score')
    }
  })

  it('rejects negative passing_score', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      passing_score: -10,
    })
    expect(result.success).toBe(false)
  })

  it('rejects max_attempts of 0', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      max_attempts: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts max_attempts of 1', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      max_attempts: 1,
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional fields as undefined', () => {
    const result = createTestSchema.safeParse({
      title: 'Test',
      description: undefined,
      instructions: undefined,
      duration_minutes: undefined,
      passing_score: undefined,
      max_attempts: undefined,
      visibility: undefined,
      status: undefined,
    })
    expect(result.success).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { referenceSchema } from '@/features/notes-manager/schema'

describe('referenceSchema', () => {
  it('passes for valid payload', () => {
    const result = referenceSchema.safeParse({
      title: 'My Ref',
      source: 'Web',
      referenceType: 'URL',
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = referenceSchema.safeParse({
      title: '',
      source: 'Web',
      referenceType: 'URL',
      url: 'https://example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Title is required')
    }
  })

  it('rejects invalid URL', () => {
    const result = referenceSchema.safeParse({
      title: 'Test',
      source: 'Web',
      referenceType: 'URL',
      url: 'not-a-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Must be a valid URL')
    }
  })

  it('rejects empty URL', () => {
    const result = referenceSchema.safeParse({
      title: 'Test',
      source: 'Web',
      referenceType: 'URL',
      url: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Must be a valid URL')
    }
  })

  it('rejects empty referenceType', () => {
    const result = referenceSchema.safeParse({
      title: 'Test',
      source: 'Web',
      referenceType: '',
      url: 'https://example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Type is required')
    }
  })

  it('passes with empty source (optional field)', () => {
    const result = referenceSchema.safeParse({
      title: 'Test',
      source: '',
      referenceType: 'URL',
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('passes without source (optional field)', () => {
    const result = referenceSchema.safeParse({
      title: 'Test',
      referenceType: 'URL',
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })

  it('boundary: title with single character passes', () => {
    const result = referenceSchema.safeParse({
      title: 'a',
      referenceType: 'URL',
      url: 'https://example.com',
    })
    expect(result.success).toBe(true)
  })
})

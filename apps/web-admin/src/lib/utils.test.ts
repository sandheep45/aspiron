import { describe, expect, it } from 'vitest'
import { cn, formatPercentage, formatRelativeTime } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined and null', () => {
    expect(cn('px-4', undefined, null, 'py-2')).toBe('px-4 py-2')
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for dates less than 1 minute ago', () => {
    expect(formatRelativeTime(new Date())).toBe('just now')
  })

  it('returns "just now" for future dates', () => {
    const future = new Date(Date.now() + 10000)
    expect(formatRelativeTime(future)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago')
  })

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago')
  })

  it('returns weeks ago', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoWeeksAgo)).toBe('2w ago')
  })

  it('returns formatted date for older dates', () => {
    const oldDate = new Date('2024-01-15')
    expect(formatRelativeTime(oldDate)).toBe('Jan 15, 2024')
  })
})

describe('formatPercentage', () => {
  it('formats 0.756 to "76%"', () => {
    expect(formatPercentage(0.756)).toBe('76%')
  })

  it('formats with decimals', () => {
    expect(formatPercentage(0.756, 1)).toBe('75.6%')
  })

  it('formats 0.5 to "50%"', () => {
    expect(formatPercentage(0.5)).toBe('50%')
  })

  it('formats 1 to "100%"', () => {
    expect(formatPercentage(1)).toBe('100%')
  })

  it('formats 0 to "0%"', () => {
    expect(formatPercentage(0)).toBe('0%')
  })

  it('returns em dash for null', () => {
    expect(formatPercentage(null)).toBe('\u2014')
  })

  it('returns em dash for undefined', () => {
    expect(formatPercentage(undefined)).toBe('\u2014')
  })
})

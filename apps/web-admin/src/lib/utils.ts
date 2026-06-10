import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 0) return 'just now'
  if (diffSec < 60) return 'just now'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}w ago`

  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatPercentage(
  value: number | null | undefined,
  decimals = 0,
): string {
  if (value == null) return '\u2014'
  return `${(value * 100).toFixed(decimals)}%`
}

export function extractFileName(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/')
    const last = segments[segments.length - 1] ?? ''
    const underscoreIdx = last.indexOf('_')
    if (underscoreIdx > 0 && underscoreIdx < last.length - 1) {
      const uuid = last.slice(0, underscoreIdx)
      if (/^[a-f0-9-]{36}$/i.test(uuid)) {
        return last.slice(underscoreIdx + 1)
      }
    }
    return last
  } catch {
    return url
  }
}

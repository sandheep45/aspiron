import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  EditorSkeleton,
  OverviewCardSkeleton,
  TableSkeleton,
} from '@/features/notes-manager/components/loading-skeleton'

describe('OverviewCardSkeleton', () => {
  it('renders with animate-pulse and 4 metric placeholders', () => {
    const { container } = render(<OverviewCardSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    const cols = container.querySelectorAll('.grid-cols-4 > div')
    expect(cols).toHaveLength(4)
    expect(cols[0].querySelector('.bg-slate-700')).toBeInTheDocument()
  })
})

describe('EditorSkeleton', () => {
  it('renders with animate-pulse, toolbar, and content lines', () => {
    const { container } = render(<EditorSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    // Toolbar: 10 button placeholders
    const toolbar = container.querySelector('.rounded-lg.bg-slate-800\\/50')
    expect(toolbar?.querySelectorAll('.size-7')).toHaveLength(10)
    // Content lines
    const lines = container.querySelectorAll(
      '.rounded-lg.bg-slate-800\\/30 > div',
    )
    expect(lines.length).toBeGreaterThanOrEqual(3)
  })
})

describe('TableSkeleton', () => {
  it('renders with default 3 rows', () => {
    const { container } = render(<TableSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    const rows = container.querySelectorAll('.rounded-lg.p-3')
    // Header row + 3 data rows
    expect(rows).toHaveLength(4)
  })

  it('renders custom row count', () => {
    const { container } = render(<TableSkeleton rows={5} />)
    const rows = container.querySelectorAll('.rounded-lg.p-3')
    expect(rows).toHaveLength(6) // header + 5
  })
})

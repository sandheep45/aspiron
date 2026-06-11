import type { MemoryGapItem, RecallStatus } from '@aspiron/api-client'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryGapTable } from '@/features/recall-insights/components/memory-gap-table'

const rememberedItem: MemoryGapItem = {
  concept: "Gauss's Law Statement",
  recall_status: 'remembered' as RecallStatus,
  confidence: 0.85,
  correctness: 90.0,
}

const partialItem: MemoryGapItem = {
  concept: 'Flux Calculation',
  recall_status: 'partial' as RecallStatus,
  confidence: 0.6,
  correctness: 50.0,
}

const forgottenWithAlert: MemoryGapItem = {
  concept: 'Spherical Symmetry',
  recall_status: 'forgotten' as RecallStatus,
  confidence: 0.3,
  correctness: 20.0,
  mismatch_alert: 'High Confidence, Low Accuracy',
}

describe('MemoryGapTable', () => {
  it('renders skeleton while loading', () => {
    const { container } = render(<MemoryGapTable items={undefined} loading />)
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(7)
  })

  it('returns null when items is undefined and not loading', () => {
    const { container } = render(
      <MemoryGapTable items={undefined} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('returns null when items is empty', () => {
    const { container } = render(<MemoryGapTable items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders column headers', () => {
    render(<MemoryGapTable items={[rememberedItem]} />)
    expect(screen.getByText('Concept')).toBeInTheDocument()
    expect(screen.getByText('Recall Status')).toBeInTheDocument()
    expect(screen.getByText('Confidence')).toBeInTheDocument()
    expect(screen.getByText('Correctness')).toBeInTheDocument()
    expect(screen.getByText('Mismatch Alert')).toBeInTheDocument()
  })

  it('renders remembered status badge', () => {
    render(<MemoryGapTable items={[rememberedItem]} />)
    expect(screen.getByText('Remembered')).toBeInTheDocument()
  })

  it('renders partial status badge', () => {
    render(<MemoryGapTable items={[partialItem]} />)
    expect(screen.getByText('Partial')).toBeInTheDocument()
  })

  it('renders forgotten status badge', () => {
    render(<MemoryGapTable items={[forgottenWithAlert]} />)
    expect(screen.getByText('Forgotten')).toBeInTheDocument()
  })

  it('renders mismatch alert', () => {
    render(<MemoryGapTable items={[forgottenWithAlert]} />)
    expect(
      screen.getByText('High Confidence, Low Accuracy'),
    ).toBeInTheDocument()
  })

  it('does not render alert badge for items without mismatch alert', () => {
    render(<MemoryGapTable items={[rememberedItem]} />)
    expect(
      screen.queryByText('High Confidence, Low Accuracy'),
    ).not.toBeInTheDocument()
  })

  it('renders multiple items', () => {
    render(
      <MemoryGapTable
        items={[rememberedItem, partialItem, forgottenWithAlert]}
      />,
    )
    expect(screen.getByText("Gauss's Law Statement")).toBeInTheDocument()
    expect(screen.getByText('Flux Calculation')).toBeInTheDocument()
    expect(screen.getByText('Spherical Symmetry')).toBeInTheDocument()
  })
})

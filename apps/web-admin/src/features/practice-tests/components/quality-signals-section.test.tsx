import type { PracticeSignal } from '@aspiron/api-client'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QualitySignalsSection } from '@/features/practice-tests/components/quality-signals-section'

const mockSignals: PracticeSignal[] = [
  { id: 's1', message: 'High accuracy detected', signal_type: 'positive' },
  { id: 's2', message: 'Moderate engagement', signal_type: 'warning' },
  { id: 's3', message: 'Low coverage', signal_type: 'negative' },
  { id: 's4', message: 'Add application questions', signal_type: 'info' },
]

describe('QualitySignalsSection', () => {
  it('renders signal cards when data is provided', () => {
    render(<QualitySignalsSection signals={mockSignals} />)
    expect(screen.getByText('High accuracy detected')).toBeInTheDocument()
    expect(screen.getByText('Moderate engagement')).toBeInTheDocument()
    expect(screen.getByText('Low coverage')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <QualitySignalsSection signals={undefined} loading />,
    )
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(4)
  })

  it('renders error state with retry button', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(
      <QualitySignalsSection
        signals={undefined}
        error={new Error('Failed to load')}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    await user.click(screen.getByText('Retry'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders error state without retry button', () => {
    render(
      <QualitySignalsSection
        signals={undefined}
        error={new Error('Failed to load')}
      />,
    )
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })

  it('renders empty state when signals array is empty', () => {
    render(<QualitySignalsSection signals={[]} />)
    expect(screen.getByText('No signals detected')).toBeInTheDocument()
  })

  it('renders empty state when signals is undefined', () => {
    render(<QualitySignalsSection signals={undefined} />)
    expect(screen.getByText('No signals detected')).toBeInTheDocument()
  })
})

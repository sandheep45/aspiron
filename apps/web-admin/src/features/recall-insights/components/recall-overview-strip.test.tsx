import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecallOverviewStrip } from '@/features/recall-insights/components/recall-overview-strip'

describe('RecallOverviewStrip', () => {
  it('renders skeleton while loading', () => {
    const { container } = render(
      <RecallOverviewStrip data={undefined} loading />,
    )
    const items = container.querySelectorAll('.animate-pulse')
    expect(items.length).toBeGreaterThanOrEqual(4)
  })

  it('returns null when data is undefined and not loading', () => {
    const { container } = render(
      <RecallOverviewStrip data={undefined} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders all 4 metric labels', () => {
    render(
      <RecallOverviewStrip
        data={{
          avg_recall_score: 72.5,
          completion_rate: 85.0,
          memory_decay: 'stable',
          last_recall_run: '2 hours ago',
        }}
      />,
    )
    expect(screen.getByText('Average Recall Score')).toBeInTheDocument()
    expect(screen.getByText('Students Completing Recall')).toBeInTheDocument()
    expect(screen.getByText('Memory Decay Trend')).toBeInTheDocument()
    expect(screen.getByText('Last Recall Analysis')).toBeInTheDocument()
  })

  it('renders metric values', () => {
    render(
      <RecallOverviewStrip
        data={{
          avg_recall_score: 72.5,
          completion_rate: 85.0,
          memory_decay: 'stable',
          last_recall_run: '2 hours ago',
        }}
      />,
    )
    expect(screen.getByText('73%')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Stable')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
  })

  it('renders degrading decay label', () => {
    render(
      <RecallOverviewStrip
        data={{
          avg_recall_score: 55.0,
          completion_rate: 60.0,
          memory_decay: 'degrading',
          last_recall_run: '1 day ago',
        }}
      />,
    )
    expect(screen.getByText('Degrading')).toBeInTheDocument()
  })

  it('renders raw memory_decay string when key is not in config', () => {
    render(
      <RecallOverviewStrip
        data={{
          avg_recall_score: 0.0,
          completion_rate: 0.0,
          memory_decay: 'unknown-status',
          last_recall_run: 'Never',
        }}
      />,
    )
    expect(screen.getByText('unknown-status')).toBeInTheDocument()
  })
})

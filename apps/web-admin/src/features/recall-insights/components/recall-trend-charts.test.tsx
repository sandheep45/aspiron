import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecallTrendCharts } from '@/features/recall-insights/components/recall-trend-charts'

const mockData = {
  recall_trend: [
    { date: '2026-01-01', value: 85.0 },
    { date: '2026-01-08', value: 72.0 },
  ],
  memory_decay_curve: [
    { date: '2026-01-01', value: 100.0 },
    { date: '2026-01-08', value: 86.0 },
  ],
  recall_by_difficulty: [{ date: '2026-01-01', value: 65.0 }],
  retention_distribution: [{ date: '2026-01-01', value: 40.0 }],
}

describe('RecallTrendCharts', () => {
  it('renders skeleton while loading', () => {
    const { container } = render(<RecallTrendCharts data={null} loading />)
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(4)
  })

  it('returns null when data is null and not loading', () => {
    const { container } = render(
      <RecallTrendCharts data={null} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('returns null when data is undefined and not loading', () => {
    const { container } = render(
      <RecallTrendCharts data={undefined} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders all 4 chart titles', () => {
    render(<RecallTrendCharts data={mockData} />)
    expect(screen.getByText('Recall Trend Over Time')).toBeInTheDocument()
    expect(screen.getByText('Memory Decay Curve')).toBeInTheDocument()
    expect(screen.getByText('Recall By Difficulty')).toBeInTheDocument()
    expect(
      screen.getByText('Student Retention Distribution'),
    ).toBeInTheDocument()
  })
})

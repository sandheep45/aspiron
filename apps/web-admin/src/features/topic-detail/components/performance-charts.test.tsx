import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PerformanceCharts } from '@/features/topic-detail/components/performance-charts'

describe('PerformanceCharts', () => {
  const mockData = {
    recall_trend: [
      { date: '2026-01-01', value: 70 },
      { date: '2026-01-08', value: 85 },
    ],
    practice_accuracy_trend: [
      { date: '2026-01-02', value: 75 },
      { date: '2026-01-09', value: 90 },
    ],
    engagement_trend: [
      { date: '2026-01-01', value: 5 },
      { date: '2026-01-08', value: 8 },
    ],
    completion_trend: [
      { date: '2026-01-02', value: 100 },
      { date: '2026-01-09', value: 100 },
    ],
  }

  it('renders all 4 chart titles', () => {
    render(<PerformanceCharts data={mockData} />)
    expect(screen.getByText('Recall Trend')).toBeInTheDocument()
    expect(screen.getByText('Practice Accuracy Trend')).toBeInTheDocument()
    expect(screen.getByText('Engagement Trend')).toBeInTheDocument()
    expect(screen.getByText('Completion Trend')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(<PerformanceCharts data={null} loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('returns null when data is null and not loading', () => {
    const { container } = render(<PerformanceCharts data={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when data has no points', () => {
    const emptyData = {
      recall_trend: [],
      practice_accuracy_trend: [],
      engagement_trend: [],
      completion_trend: [],
    }
    const { container } = render(<PerformanceCharts data={emptyData} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders charts grid container', () => {
    const { container } = render(<PerformanceCharts data={mockData} />)
    expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument()
  })
})

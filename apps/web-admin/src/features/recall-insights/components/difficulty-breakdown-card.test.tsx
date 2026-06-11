import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DifficultyBreakdownCard } from '@/features/recall-insights/components/difficulty-breakdown-card'

describe('DifficultyBreakdownCard', () => {
  it('renders skeleton while loading', () => {
    const { container } = render(
      <DifficultyBreakdownCard items={undefined} loading />,
    )
    expect(
      container.querySelectorAll('.animate-pulse').length,
    ).toBeGreaterThanOrEqual(3)
  })

  it('returns null when items is undefined and not loading', () => {
    const { container } = render(
      <DifficultyBreakdownCard items={undefined} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('returns null when items is empty', () => {
    const { container } = render(
      <DifficultyBreakdownCard items={[]} loading={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders difficulty cards with accuracy and count', () => {
    render(
      <DifficultyBreakdownCard
        items={[
          { difficulty: 'Easy', accuracy: 92.5, count: 4 as unknown as bigint },
          {
            difficulty: 'Medium',
            accuracy: 75.0,
            count: 5 as unknown as bigint,
          },
          { difficulty: 'Hard', accuracy: 55.0, count: 3 as unknown as bigint },
        ]}
      />,
    )
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
    expect(screen.getByText('93%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('55%')).toBeInTheDocument()
    expect(screen.getByText('4 questions')).toBeInTheDocument()
    expect(screen.getByText('5 questions')).toBeInTheDocument()
    expect(screen.getByText('3 questions')).toBeInTheDocument()
  })

  it('uses singular for 1 question', () => {
    render(
      <DifficultyBreakdownCard
        items={[
          {
            difficulty: 'Easy',
            accuracy: 100.0,
            count: 1 as unknown as bigint,
          },
        ]}
      />,
    )
    expect(screen.getByText('1 question')).toBeInTheDocument()
  })

  it('uses default style for unknown difficulty', () => {
    render(
      <DifficultyBreakdownCard
        items={[
          {
            difficulty: 'Unknown',
            accuracy: 50.0,
            count: 2 as unknown as bigint,
          },
        ]}
      />,
    )
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PracticeOverviewCard } from '@/features/practice-tests/components/practice-overview-card'

const mockData = {
  total_questions: 15,
  average_accuracy: 72.5,
  total_tests: 3,
  last_test_conducted: '2 days ago',
}

describe('PracticeOverviewCard', () => {
  it('renders all metric labels', () => {
    render(<PracticeOverviewCard data={mockData} />)
    expect(screen.getByText('Total Practice Questions')).toBeInTheDocument()
    expect(screen.getByText('Average Practice Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Total Topic Tests')).toBeInTheDocument()
    expect(screen.getByText('Last Test Conducted')).toBeInTheDocument()
  })

  it('renders metric values', () => {
    render(<PracticeOverviewCard data={mockData} />)
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('72.5%')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2 days ago')).toBeInTheDocument()
  })

  it('renders fallback dash for null values', () => {
    render(
      <PracticeOverviewCard
        data={{
          total_questions: null as unknown as number,
          average_accuracy: null as unknown as number,
          total_tests: null as unknown as number,
          last_test_conducted: null as unknown as string,
        }}
      />,
    )
    expect(screen.getAllByText('\u2014').length).toBe(4)
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <PracticeOverviewCard data={undefined} loading />,
    )
    expect(container.querySelectorAll('.animate-pulse').length).toBe(12)
  })

  it('renders with undefined data', () => {
    render(<PracticeOverviewCard data={undefined} />)
    expect(screen.getAllByText('\u2014').length).toBe(4)
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubjectProgressCard } from '@/features/content-dashboard/components/subject-progress-card'

describe('SubjectProgressCard', () => {
  it('renders subject name and stats', () => {
    render(
      <SubjectProgressCard
        subject={{
          id: '1',
          name: 'Physics',
          completion: 87,
          total_topics: 68 as unknown as bigint,
          published_topics: 59 as unknown as bigint,
          draft_topics: 9 as unknown as bigint,
        }}
      />,
    )
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('87%')).toBeInTheDocument()
    expect(screen.getByText('68')).toBeInTheDocument()
    expect(screen.getByText('59')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })
})

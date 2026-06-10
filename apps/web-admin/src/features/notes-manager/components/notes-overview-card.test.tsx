import type { NotesOverview } from '@aspiron/api-client'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NotesOverviewCard } from '@/features/notes-manager/components/notes-overview-card'

const mockData: NotesOverview = {
  teacher_notes_status: 'published',
  ai_notes_status: 'approved',
  external_references_count: 5,
  student_engagement: 78,
}

describe('NotesOverviewCard', () => {
  it('renders 4 metric labels', () => {
    render(<NotesOverviewCard data={mockData} />)
    expect(screen.getByText('Teacher Notes')).toBeInTheDocument()
    expect(screen.getByText('AI Notes')).toBeInTheDocument()
    expect(screen.getByText('External References')).toBeInTheDocument()
    expect(screen.getByText('Student Engagement')).toBeInTheDocument()
  })

  it('renders computed values from data', () => {
    render(<NotesOverviewCard data={mockData} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('5 Linked')).toBeInTheDocument()
    expect(screen.getByText('78%')).toBeInTheDocument()
  })

  it('renders loading state with animated placeholders', () => {
    const { container } = render(<NotesOverviewCard data={mockData} loading />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    // No computed values in loading state
    expect(screen.queryByText('Published')).not.toBeInTheDocument()
    expect(screen.queryByText('78%')).not.toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(
      <NotesOverviewCard
        data={{
          teacher_notes_status: 'none',
          ai_notes_status: 'none',
          external_references_count: 0,
          student_engagement: 0,
        }}
      />,
    )
    expect(screen.getByText('0 Linked')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SubjectsTable } from '@/features/subjects-page/components/subjects-table'

describe('SubjectsTable', () => {
  const subjects = [
    {
      id: '1',
      name: 'Physics',
      chapters_count: 12 as unknown as bigint,
      topics_published: 59 as unknown as bigint,
      coverage: 87,
      average_recall: 0.62,
      practice_accuracy: 0.74,
      status: 'Needs Attention',
    },
    {
      id: '2',
      name: 'Chemistry',
      chapters_count: 10 as unknown as bigint,
      topics_published: 39 as unknown as bigint,
      coverage: 72,
      average_recall: 0.81,
      practice_accuracy: 0.85,
      status: 'Healthy',
    },
  ]

  it('renders all 8 column headers', () => {
    render(<SubjectsTable subjects={subjects} />)
    expect(screen.getByText('Subject Name')).toBeInTheDocument()
    expect(screen.getByText('Chapters')).toBeInTheDocument()
    expect(screen.getByText('Topics Published')).toBeInTheDocument()
    expect(screen.getByText('Coverage')).toBeInTheDocument()
    expect(screen.getByText('Avg Recall')).toBeInTheDocument()
    expect(screen.getByText('Practice Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders subject names in rows', () => {
    render(<SubjectsTable subjects={subjects} />)
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('Chemistry')).toBeInTheDocument()
  })

  it('renders empty state when no subjects', () => {
    render(<SubjectsTable subjects={[]} />)
    expect(screen.getByText('No subjects found')).toBeInTheDocument()
  })

  it('calls onViewChapters with subject id on click', async () => {
    const onViewChapters = vi.fn()
    render(
      <SubjectsTable subjects={subjects} onViewChapters={onViewChapters} />,
    )
    const buttons = screen.getAllByText('View Chapters')
    await userEvent.setup().click(buttons[0])
    expect(onViewChapters).toHaveBeenCalledWith('1')
  })

  it('renders View Chapters buttons for each row', () => {
    render(<SubjectsTable subjects={subjects} />)
    const buttons = screen.getAllByText('View Chapters')
    expect(buttons).toHaveLength(2)
  })

  it('shows em dash for null accuracy', () => {
    const subjectsWithNull = [
      {
        id: '1',
        name: 'Physics',
        chapters_count: 12 as unknown as bigint,
        topics_published: 59 as unknown as bigint,
        coverage: 87,
        average_recall: 0.62,
        practice_accuracy: null,
        status: 'Needs Attention',
      },
    ]
    render(<SubjectsTable subjects={subjectsWithNull} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

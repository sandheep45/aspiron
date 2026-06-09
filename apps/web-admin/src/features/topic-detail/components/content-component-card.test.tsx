import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContentComponentCard } from '@/features/topic-detail/components/content-component-card'

describe('ContentComponentCard', () => {
  const defaultProps = {
    id: 'video',
    name: 'Introduction Video',
    status: 'published',
    performance: '12 students completed',
    action: 'Manage Video',
  }

  it('renders name, status, performance, and action', () => {
    render(<ContentComponentCard {...defaultProps} />)
    expect(screen.getByText('Introduction Video')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('12 students completed')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Manage Video' }),
    ).toBeInTheDocument()
  })

  it('renders published with emerald status', () => {
    const { container } = render(<ContentComponentCard {...defaultProps} />)
    expect(container.querySelector('.bg-emerald-500\\/10')).toBeInTheDocument()
    expect(container.querySelector('.text-emerald-400')).toBeInTheDocument()
  })

  it('renders draft with slate status', () => {
    const { container } = render(
      <ContentComponentCard {...defaultProps} status='draft' />,
    )
    expect(container.querySelector('.bg-slate-500\\/10')).toBeInTheDocument()
    expect(container.querySelector('.text-slate-400')).toBeInTheDocument()
  })

  it('renders review required with amber status', () => {
    const { container } = render(
      <ContentComponentCard {...defaultProps} status='review required' />,
    )
    expect(container.querySelector('.bg-amber-500\\/10')).toBeInTheDocument()
    expect(container.querySelector('.text-amber-400')).toBeInTheDocument()
  })

  it('renders archived with red status', () => {
    const { container } = render(
      <ContentComponentCard {...defaultProps} status='archived' />,
    )
    expect(container.querySelector('.bg-red-500\\/10')).toBeInTheDocument()
    expect(container.querySelector('.text-red-400')).toBeInTheDocument()
  })

  it('maps component id to correct icon', () => {
    const ids = [
      'video',
      'practice-questions',
      'recall',
      'study-notes',
      'assignments',
      'flashcards',
    ]
    for (const id of ids) {
      const { unmount } = render(
        <ContentComponentCard {...defaultProps} id={id} name={id} />,
      )
      expect(screen.getByText(id)).toBeInTheDocument()
      unmount()
    }
  })
})

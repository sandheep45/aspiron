import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '@/components/ui/empty-state'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title='No chapters found'
        description='Try adjusting your search query.'
      />,
    )
    expect(screen.getByText('No chapters found')).toBeInTheDocument()
    expect(
      screen.getByText('Try adjusting your search query.'),
    ).toBeInTheDocument()
  })

  it('renders with different text', () => {
    render(<EmptyState title='No data' description='No data available.' />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('No data available.')).toBeInTheDocument()
  })
})

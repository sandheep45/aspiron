import { render, screen } from '@testing-library/react'
import { BookOpen } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '@/features/content-dashboard/components/empty-state'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={BookOpen}
        title='No data'
        description='Nothing to show yet.'
      />,
    )
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument()
  })
})

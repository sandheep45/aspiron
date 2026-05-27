import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'

function createMockQuery(overrides: Record<string, unknown> = {}) {
  return {
    isLoading: false,
    isError: false,
    error: null,
    data: null,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('DashboardModule', () => {
  it('renders skeleton when loading', () => {
    const query = createMockQuery({ isLoading: true })

    render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div data-testid='test-skeleton'>Loading...</div>}
        empty={{ title: 'No data', description: 'Nothing here' }}
        render={() => <div>Content</div>}
      />,
    )

    expect(screen.getByTestId('test-skeleton')).toBeInTheDocument()
    expect(screen.getByText('Test Section')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders error state with retry button', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    const query = createMockQuery({
      isError: true,
      error: new Error('API failure'),
      refetch,
    })

    render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No data', description: 'Nothing here' }}
        render={() => <div>Content</div>}
      />,
    )

    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('API failure')).toBeInTheDocument()

    await user.click(screen.getByTestId('retry-button'))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when data is null', () => {
    const query = createMockQuery({ data: null })

    render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No items', description: 'Nothing to show yet' }}
        render={() => <div>Content</div>}
      />,
    )

    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('Nothing to show yet')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders empty state when data is empty array', () => {
    const query = createMockQuery({ data: [] })

    render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No items', description: 'Nothing here' }}
        render={() => <div>Content</div>}
      />,
    )

    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('renders content on success', () => {
    const query = createMockQuery({ data: { insights: ['a', 'b'] } })

    render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No data', description: 'Nothing here' }}
        render={(data) => (
          <div data-testid='content'>{data.insights.length} items</div>
        )}
      />,
    )

    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByText('2 items')).toBeInTheDocument()
  })

  it('sets data-dashboard-section attribute on success', () => {
    const query = createMockQuery({ data: { ok: true } })

    const { container } = render(
      <DashboardModule
        title='Test Section'
        sectionId='action-required'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No data', description: 'Nothing here' }}
        render={() => <div>Content</div>}
      />,
    )

    expect(
      container.querySelector('[data-dashboard-section="action-required"]'),
    ).toBeInTheDocument()
  })

  it('renders section accent bar when sectionAccent is provided', () => {
    const query = createMockQuery({ data: { ok: true } })

    const { container } = render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        sectionAccent='bg-emerald-500'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No data', description: 'Nothing here' }}
        render={() => <div>Content</div>}
      />,
    )

    const bar = container.querySelector('.rounded-full')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveClass('bg-emerald-500')
  })

  it('does not render accent bar when sectionAccent is not provided', () => {
    const query = createMockQuery({ data: { ok: true } })

    const { container } = render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{ title: 'No data', description: 'Nothing here' }}
        render={() => <div>Content</div>}
      />,
    )

    expect(container.querySelector('.rounded-full')).not.toBeInTheDocument()
  })

  it('renders empty action CTA when provided', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const query = createMockQuery({ data: null })

    render(
      <DashboardModule
        title='Test Section'
        sectionId='test-section'
        query={query}
        skeleton={<div>Skeleton</div>}
        empty={{
          title: 'No data',
          description: 'Nothing here',
          action: { label: 'Create One', onClick: onAction },
        }}
        render={() => <div>Content</div>}
      />,
    )

    const cta = screen.getByText('Create One')
    expect(cta).toBeInTheDocument()
    await user.click(cta)
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModuleErrorBoundary } from '@/features/dashboard/components/module-error-boundary'

function ThrowOnRender({ message }: { message: string }) {
  throw new Error(message)
}

describe('ModuleErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ModuleErrorBoundary title='Test' sectionId='test'>
        <div data-testid='child'>OK</div>
      </ModuleErrorBoundary>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.queryByTestId('module-error')).not.toBeInTheDocument()
  })

  it('catches render error and shows fallback', () => {
    render(
      <ModuleErrorBoundary title='Test' sectionId='test'>
        <ThrowOnRender message='crash' />
      </ModuleErrorBoundary>,
    )

    expect(screen.getByTestId('module-error')).toBeInTheDocument()
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(
      screen.getByText('This section encountered an error and was isolated.'),
    ).toBeInTheDocument()
  })

  it('recovers after retry click', async () => {
    const user = userEvent.setup()
    let shouldThrow = true

    function FlakyComponent() {
      if (shouldThrow) {
        throw new Error('flaky')
      }
      return <div data-testid='recovered'>Recovered</div>
    }

    render(
      <ModuleErrorBoundary title='Test' sectionId='test'>
        <FlakyComponent />
      </ModuleErrorBoundary>,
    )

    expect(screen.getByTestId('module-error')).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByTestId('retry-button'))

    expect(screen.getByTestId('recovered')).toBeInTheDocument()
  })
})

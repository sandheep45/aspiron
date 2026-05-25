import { AlertTriangle } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryHandlerProps {
  children: ReactNode
  fallback: (context: { reset: () => void; error: Error | null }) => ReactNode
}

interface ErrorBoundaryHandlerState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryHandler extends Component<
  ErrorBoundaryHandlerProps,
  ErrorBoundaryHandlerState
> {
  state: ErrorBoundaryHandlerState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundaryHandler]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        reset: this.handleRetry,
        error: this.state.error,
      })
    }
    return this.props.children
  }
}

interface ModuleErrorBoundaryProps {
  title: string
  sectionId: string
  children: ReactNode
}

export function ModuleErrorBoundary({
  title,
  sectionId,
  children,
}: ModuleErrorBoundaryProps) {
  return (
    <ErrorBoundaryHandler
      fallback={({ reset }) => (
        <section data-dashboard-section={sectionId}>
          <h2 className='mb-4 font-semibold text-white text-xl'>{title}</h2>
          <div
            data-testid='module-error'
            className='flex flex-col items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center'
          >
            <AlertTriangle className='h-8 w-8 text-red-400' />
            <p className='text-red-300 text-sm'>
              This section encountered an error and was isolated.
            </p>
            <Button
              data-testid='retry-button'
              variant='outline'
              size='sm'
              onClick={reset}
            >
              Retry
            </Button>
          </div>
        </section>
      )}
    >
      {children}
    </ErrorBoundaryHandler>
  )
}

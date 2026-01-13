/**
 * Generic error boundary component for React Query errors
 */

import { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
  onError?: (error: Error) => void
}

class QueryErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Query Error Boundary caught an error:', error, errorInfo)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback
        ? this.props.fallback(this.state.error)
        : this.renderDefaultError()
    }

    return this.props.children
  }

  private renderDefaultError() {
    return (
      <div
        style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffebee',
          color: '#c62828',
        }}
      >
        <h3>Something went wrong</h3>
        <p>An error occurred while loading data. Please try again.</p>
        <button
          type='button'
          onClick={() => this.setState({ hasError: false, error: null })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#c62828',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    )
  }
}

/**
 * Hook to reset error boundary state
 */
export const useErrorBoundaryReset = () => {
  return () => {
    // This would be used with ErrorBoundary context
    // For now, consumers can implement their own reset logic
  }
}

export default QueryErrorBoundary

import type { PracticeSignal } from '@aspiron/api-client'
import { AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { InsightCard } from '@/features/practice-tests/components/insight-card'
import { SignalsSkeleton } from '@/features/practice-tests/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface QualitySignalsSectionProps {
  signals: PracticeSignal[] | undefined
  loading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
}

export function QualitySignalsSection({
  signals,
  loading,
  error,
  onRetry,
  className,
}: QualitySignalsSectionProps) {
  if (loading) {
    return <SignalsSkeleton />
  }

  if (error) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
        <p className='text-red-300 text-sm'>
          {error.message || 'Failed to load signals'}
        </p>
        {onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='rounded-md border border-red-500/30 px-3 py-1.5 text-red-400 text-xs hover:bg-red-500/10'
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (!signals || signals.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title='No signals detected'
        description='Quality signals will appear as data accumulates.'
      />
    )
  }

  return (
    <div className={cn('grid gap-3 md:grid-cols-2', className)}>
      {signals.map((signal) => (
        <InsightCard
          key={signal.id}
          message={signal.message}
          signalType={signal.signal_type}
        />
      ))}
    </div>
  )
}

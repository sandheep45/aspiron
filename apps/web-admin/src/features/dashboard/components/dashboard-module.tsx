import { AlertCircle, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ModuleErrorBoundary } from '@/features/dashboard/components/module-error-boundary'

interface DashboardEmpty {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface DashboardModuleProps<T> {
  title: string
  sectionId: string
  query: {
    isLoading: boolean
    isError: boolean
    error: Error | null
    data: T | undefined
    refetch: () => void
  }
  skeleton: ReactNode
  empty: DashboardEmpty
  isEmpty?: (data: NonNullable<T>) => boolean
  render: (data: NonNullable<T>) => ReactNode
}

function DashboardModuleInner<T>({
  title,
  sectionId,
  query,
  skeleton,
  empty,
  isEmpty,
  render,
}: DashboardModuleProps<T>) {
  if (query.isLoading) {
    return (
      <section data-dashboard-section={sectionId}>
        <h2 className='mb-4 font-semibold text-white text-xl'>{title}</h2>
        {skeleton}
      </section>
    )
  }

  if (query.isError) {
    return (
      <section data-dashboard-section={sectionId}>
        <h2 className='mb-4 font-semibold text-white text-xl'>{title}</h2>
        <div
          data-testid='module-error'
          className='flex flex-col items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-6 text-center'
        >
          <AlertCircle className='h-8 w-8 text-red-400' />
          <p className='text-red-300 text-sm'>
            {query.error?.message || 'Something went wrong'}
          </p>
          <Button
            data-testid='retry-button'
            variant='outline'
            size='sm'
            onClick={() => query.refetch()}
          >
            <RefreshCw className='mr-1 h-3 w-3' />
            Retry
          </Button>
        </div>
      </section>
    )
  }

  const safeData = query.data as NonNullable<T> | undefined

  const isDataEmpty =
    !safeData ||
    (Array.isArray(safeData) && safeData.length === 0) ||
    isEmpty?.(safeData)

  if (isDataEmpty) {
    return (
      <section data-dashboard-section={sectionId}>
        <h2 className='mb-4 font-semibold text-white text-xl'>{title}</h2>
        <div className='flex flex-col items-center gap-2 rounded-lg border border-slate-700 border-dashed p-8 text-center'>
          <p className='font-medium text-slate-300'>{empty.title}</p>
          <p className='text-slate-500 text-sm'>{empty.description}</p>
          {empty.action && (
            <Button
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={empty.action.onClick}
            >
              {empty.action.label}
            </Button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section data-dashboard-section={sectionId}>
      <h2 className='mb-4 font-semibold text-white text-xl'>{title}</h2>
      {render(safeData)}
    </section>
  )
}

export function DashboardModule<T>(props: DashboardModuleProps<T>) {
  return (
    <ModuleErrorBoundary title={props.title} sectionId={props.sectionId}>
      <DashboardModuleInner {...props} />
    </ModuleErrorBoundary>
  )
}

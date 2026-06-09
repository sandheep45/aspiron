import {
  useSubjectsPageSignalsQuery,
  useSubjectsPageSubjectsQuery,
  useSubjectsPageSummaryQuery,
} from '@aspiron/tanstack-client'
import { RefreshCw } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { SubjectSignals } from '@/features/subjects-page/components/subject-signals'
import { SubjectSummaryRow } from '@/features/subjects-page/components/subject-summary-row'
import { SubjectsTable } from '@/features/subjects-page/components/subjects-table'

interface SubjectsPageProps {
  onViewChapters?: (subjectId: string) => void
}

export function SubjectsPage({ onViewChapters }: SubjectsPageProps) {
  const subjects = useSubjectsPageSubjectsQuery()
  const summary = useSubjectsPageSummaryQuery()
  const signals = useSubjectsPageSignalsQuery()

  const handleRefresh = useCallback(() => {
    subjects.refetch()
    summary.refetch()
    signals.refetch()
  }, [subjects, summary, signals])

  return (
    <div className='flex w-full min-w-0 flex-col gap-8 overflow-x-hidden pb-10'>
      {/* Header */}
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='font-semibold text-2xl text-white'>Subjects</h1>
          <p className='mt-1 text-slate-400 text-sm'>
            Choose a subject to review content health, coverage, and performance
            before exploring chapters.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon-sm' onClick={handleRefresh}>
            <RefreshCw className='size-3.5' />
          </Button>
        </div>
      </header>

      {/* Section 1: Subject Summary */}
      <section className='min-w-0'>
        {summary.isLoading ? (
          <LoadingSkeleton variant='summary' />
        ) : summary.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {summary.error?.message || 'Failed to load subject summary'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => summary.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : summary.data ? (
          <SubjectSummaryRow summary={summary.data} />
        ) : null}
      </section>

      {/* Section 2: Subjects Table (PRIMARY) */}
      <section className='min-w-0'>
        {subjects.isLoading ? (
          <LoadingSkeleton variant='table' />
        ) : subjects.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {subjects.error?.message || 'Failed to load subjects'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => subjects.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <SubjectsTable
            subjects={subjects.data ?? []}
            onViewChapters={onViewChapters}
          />
        )}
      </section>

      {/* Section 3: Subject Signals */}
      <section className='min-w-0'>
        {signals.isLoading ? (
          <LoadingSkeleton variant='signals' />
        ) : signals.isError ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center'>
            <p className='text-red-300 text-sm'>
              {signals.error?.message || 'Failed to load subject signals'}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => signals.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <SubjectSignals signals={signals.data ?? []} />
        )}
      </section>
    </div>
  )
}

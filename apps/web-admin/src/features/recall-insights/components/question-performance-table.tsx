import type { McqQuestionItem } from '@aspiron/api-client'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuestionTableSkeleton } from '@/features/recall-insights/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface QuestionPerformanceTableProps {
  items: McqQuestionItem[] | undefined
  loading?: boolean
  className?: string
}

type SortField =
  | 'question_number'
  | 'difficulty'
  | 'recall_accuracy'
  | 'attempts'
type SortOrder = 'asc' | 'desc'

const difficultyBadge: Record<string, string> = {
  Easy: 'bg-emerald-500/10 text-emerald-400',
  Medium: 'bg-amber-500/10 text-amber-400',
  Hard: 'bg-red-500/10 text-red-400',
}

export function QuestionPerformanceTable({
  items,
  loading,
  className,
}: QuestionPerformanceTableProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('question_number')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [page, setPage] = useState(1)
  const limit = 10

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortOrder('asc')
      }
    },
    [sortField],
  )

  const filtered = useMemo(() => {
    if (!items) return []
    let result = [...items]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.concept.toLowerCase().includes(q) ||
          item.difficulty.toLowerCase().includes(q) ||
          item.question_number.toLowerCase().includes(q),
      )
    }
    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'question_number') {
        cmp = a.question_number.localeCompare(b.question_number)
      } else if (sortField === 'difficulty') {
        cmp = a.difficulty.localeCompare(b.difficulty)
      } else if (sortField === 'recall_accuracy') {
        cmp = a.recall_accuracy - b.recall_accuracy
      } else if (sortField === 'attempts') {
        cmp = a.attempts - b.attempts
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return result
  }, [items, search, sortField, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit))
  const paginated = filtered.slice((page - 1) * limit, page * limit)

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown

  if (loading) return <QuestionTableSkeleton />
  if (!items || items.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className='relative'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
        <Input
          placeholder='Search questions...'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className='h-9 border-white/5 bg-slate-900/50 pl-9 text-xs placeholder:text-slate-600 focus:border-indigo-500/40'
        />
      </div>

      <div className='overflow-x-auto rounded-xl border border-white/5'>
        <table className='w-full'>
          <thead>
            <tr className='border-white/5 border-b bg-slate-900/80'>
              {(
                [
                  { key: 'question_number', label: 'Question #' },
                  { key: 'concept', label: 'Concept' },
                  { key: 'difficulty', label: 'Difficulty' },
                  { key: 'recall_accuracy', label: 'Recall Accuracy' },
                  { key: 'attempts', label: 'Attempts' },
                ] as const
              ).map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as SortField)}
                  className='cursor-pointer px-4 py-3 text-left font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider transition-colors hover:text-white'
                >
                  <div className='flex items-center gap-1.5'>
                    {col.label}
                    {sortField === col.key && <SortIcon className='size-3' />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr
                key={item.question_number}
                className='border-white/5 border-b transition-colors last:border-b-0 hover:bg-slate-800/30'
              >
                <td className='px-4 py-3 font-mono text-slate-300 text-xs'>
                  {item.question_number}
                </td>
                <td className='max-w-xs truncate px-4 py-3 text-slate-300 text-xs'>
                  {item.concept}
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={cn(
                      'inline-flex rounded-md px-2 py-0.5 font-semibold text-[0.65rem] uppercase tracking-wider',
                      difficultyBadge[item.difficulty] ??
                        'bg-slate-500/10 text-slate-400',
                    )}
                  >
                    {item.difficulty}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-800'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.recall_accuracy >= 70
                            ? 'bg-emerald-500'
                            : item.recall_accuracy >= 40
                              ? 'bg-amber-500'
                              : 'bg-red-500',
                        )}
                        style={{
                          width: `${Math.min(item.recall_accuracy, 100)}%`,
                        }}
                      />
                    </div>
                    <span className='w-8 text-right font-mono text-slate-400 text-xs tabular-nums'>
                      {Math.round(item.recall_accuracy)}%
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3 font-mono text-slate-400 text-xs tabular-nums'>
                  {item.attempts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <span className='text-[0.65rem] text-slate-500'>
            Page {page} of {totalPages}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className='h-7 text-xs'
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className='h-7 text-xs'
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

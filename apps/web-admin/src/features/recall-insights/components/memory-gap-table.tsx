import type { MemoryGapItem, RecallStatus } from '@aspiron/api-client'
import { AlertTriangle } from 'lucide-react'
import { MemoryGapTableSkeleton } from '@/features/recall-insights/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface MemoryGapTableProps {
  items: MemoryGapItem[] | undefined
  loading?: boolean
  className?: string
}

const statusStyles: Record<
  RecallStatus,
  { bg: string; text: string; dot: string }
> = {
  remembered: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
  },
  partial: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
  },
  forgotten: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    dot: 'bg-red-500',
  },
}

const statusLabels: Record<RecallStatus, string> = {
  remembered: 'Remembered',
  partial: 'Partial',
  forgotten: 'Forgotten',
}

const defaultStatusStyle = {
  bg: 'bg-slate-500/10',
  text: 'text-slate-400',
  dot: 'bg-slate-500',
}

export function MemoryGapTable({
  items,
  loading,
  className,
}: MemoryGapTableProps) {
  if (loading) return <MemoryGapTableSkeleton />
  if (!items || items.length === 0) return null

  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-white/5',
        className,
      )}
    >
      <table className='w-full'>
        <thead>
          <tr className='border-white/5 border-b bg-slate-900/80'>
            {[
              'Concept',
              'Recall Status',
              'Confidence',
              'Correctness',
              'Mismatch Alert',
            ].map((label) => (
              <th
                key={label}
                className='px-4 py-3 text-left font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider'
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const statusStyle =
              statusStyles[item.recall_status] ?? defaultStatusStyle
            return (
              <tr
                key={item.concept}
                className='border-white/5 border-b transition-colors last:border-b-0 hover:bg-slate-800/30'
              >
                <td className='px-4 py-3 text-slate-300 text-xs'>
                  {item.concept}
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-[0.65rem]',
                      statusStyle.bg,
                      statusStyle.text,
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        statusStyle.dot,
                      )}
                    />
                    {statusLabels[item.recall_status] ?? item.recall_status}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-800'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.confidence >= 0.7
                            ? 'bg-emerald-500'
                            : item.confidence >= 0.4
                              ? 'bg-amber-500'
                              : 'bg-red-500',
                        )}
                        style={{
                          width: `${Math.min(item.confidence * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className='w-8 text-right font-mono text-slate-400 text-xs tabular-nums'>
                      {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-16 overflow-hidden rounded-full bg-slate-800'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          item.correctness >= 70
                            ? 'bg-emerald-500'
                            : item.correctness >= 40
                              ? 'bg-amber-500'
                              : 'bg-red-500',
                        )}
                        style={{ width: `${Math.min(item.correctness, 100)}%` }}
                      />
                    </div>
                    <span className='w-8 text-right font-mono text-slate-400 text-xs tabular-nums'>
                      {Math.round(item.correctness)}%
                    </span>
                  </div>
                </td>
                <td className='px-4 py-3'>
                  {item.mismatch_alert ? (
                    <span className='inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2 py-0.5 font-medium text-[0.65rem] text-rose-400'>
                      <AlertTriangle className='size-3' />
                      {item.mismatch_alert}
                    </span>
                  ) : (
                    <span className='text-[0.65rem] text-slate-600'>
                      {'\u2014'}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

import type { MissingConceptItem } from '@aspiron/api-client'
import { cn } from '@/lib/utils'

interface MissingConceptCardProps {
  concept: MissingConceptItem
  rank: number
  className?: string
}

export function MissingConceptCard({
  concept,
  rank,
  className,
}: MissingConceptCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-500/20',
        className,
      )}
    >
      <div className='flex items-start gap-3'>
        <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-rose-500/10 font-bold font-mono text-rose-400 text-xs'>
          {rank}
        </span>
        <div className='flex flex-1 flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <span className='font-medium text-sm text-white'>
              {concept.concept}
            </span>
            <span className='font-semibold text-rose-400 text-xs'>
              {Math.round(concept.percentage_missing)}% missing
            </span>
          </div>
          <p className='text-slate-400 text-xs leading-relaxed'>
            {concept.ai_summary}
          </p>
        </div>
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-800'>
        <div
          className='h-full rounded-full bg-rose-500 transition-all duration-500'
          style={{ width: `${Math.min(concept.percentage_missing, 100)}%` }}
        />
      </div>
    </div>
  )
}

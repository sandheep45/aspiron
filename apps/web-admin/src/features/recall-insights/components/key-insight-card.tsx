import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KeyInsightCardProps {
  insight: string
  className?: string
}

export function KeyInsightCard({ insight, className }: KeyInsightCardProps) {
  if (!insight) return null

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/10 to-amber-900/5 p-5 backdrop-blur-sm',
        className,
      )}
    >
      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10'>
        <Lightbulb className='size-5 text-amber-400' />
      </div>
      <div className='flex flex-col gap-1'>
        <span className='font-semibold text-amber-300 text-xs uppercase tracking-wider'>
          Key Insight
        </span>
        <p className='text-slate-300 text-sm leading-relaxed'>{insight}</p>
      </div>
    </div>
  )
}

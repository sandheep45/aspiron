import type { SuggestedActionItem } from '@aspiron/api-client'
import {
  AlertTriangle,
  BarChart,
  HelpCircle,
  type LucideIcon,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SuggestedActionCardProps {
  action: SuggestedActionItem
  className?: string
}

const iconMap: Record<string, LucideIcon> = {
  'alert-triangle': AlertTriangle,
  'bar-chart': BarChart,
  'trending-down': TrendingDown,
  'help-circle': HelpCircle,
}

export function SuggestedActionCard({
  action,
  className,
}: SuggestedActionCardProps) {
  const Icon = iconMap[action.icon] ?? AlertTriangle

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/20',
        className,
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10'>
          <Icon className='size-5 text-rose-400' />
        </div>
        <div className='flex flex-1 flex-col gap-1'>
          <span className='font-medium text-sm text-white'>
            {action.detected_issue}
          </span>
          <p className='text-slate-400 text-xs leading-relaxed'>
            {action.explanation}
          </p>
        </div>
      </div>
      <div className='flex items-center justify-between rounded-xl bg-slate-800/50 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <span className='text-[0.65rem] text-slate-500'>Suggested fix:</span>
          <span className='text-slate-300 text-xs'>{action.suggested_fix}</span>
        </div>
        <Button variant='brand' size='sm' className='h-7 shrink-0 text-xs'>
          {action.primary_cta}
        </Button>
      </div>
    </div>
  )
}

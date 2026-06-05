import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  Healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Needs Attention': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Critical: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    statusColors[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'

  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold text-[0.65rem]',
        colorClass,
      )}
    >
      {status}
    </Badge>
  )
}

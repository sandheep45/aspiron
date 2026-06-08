import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  needs_attention: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const statusLabels: Record<string, string> = {
  healthy: 'Healthy',
  needs_attention: 'Needs Attention',
  critical: 'Critical',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    statusColors[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  const label = statusLabels[status] || status

  return (
    <Badge
      variant='outline'
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-semibold text-[0.65rem]',
        colorClass,
      )}
    >
      {label}
    </Badge>
  )
}

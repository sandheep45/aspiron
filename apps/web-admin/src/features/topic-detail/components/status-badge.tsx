import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    healthy: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
    },
    'needs attention': {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
    },
    critical: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  }

const defaultConfig = {
  bg: 'bg-slate-500/10',
  text: 'text-slate-400',
  dot: 'bg-slate-500',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] ?? defaultConfig

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  )
}

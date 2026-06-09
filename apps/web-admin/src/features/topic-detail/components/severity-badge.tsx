import { cn } from '@/lib/utils'

interface SeverityBadgeProps {
  severity: string
  className?: string
}

const severityConfig: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  critical: {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  high: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  medium: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  low: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
}

const defaultConfig = {
  bg: 'bg-slate-500/15',
  text: 'text-slate-400',
  border: 'border-slate-500/30',
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity.toLowerCase()] ?? defaultConfig

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-semibold text-[0.65rem] uppercase tracking-wider',
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      {severity}
    </span>
  )
}

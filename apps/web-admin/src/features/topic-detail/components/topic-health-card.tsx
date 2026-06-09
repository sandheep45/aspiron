import type { LucideIcon } from 'lucide-react'
import { TopicHealthCardSkeleton } from '@/features/topic-detail/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface TopicHealthCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  supportingText: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  loading?: boolean
  className?: string
}

const sentimentStyles: Record<
  string,
  { bg: string; text: string; border: string; icon: string }
> = {
  positive: {
    bg: 'from-emerald-900/20 to-emerald-900/5',
    text: 'text-emerald-300',
    border: 'hover:border-emerald-500/20',
    icon: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
  },
  neutral: {
    bg: 'from-amber-900/20 to-amber-900/5',
    text: 'text-amber-300',
    border: 'hover:border-amber-500/20',
    icon: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
  },
  negative: {
    bg: 'from-red-900/20 to-red-900/5',
    text: 'text-red-300',
    border: 'hover:border-red-500/20',
    icon: 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20',
  },
}

const defaultSentiment = {
  bg: '',
  text: 'text-white',
  border: 'hover:border-indigo-500/20',
  icon: 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20',
}

function deriveSentiment(
  title: string,
  value: string | number,
): 'positive' | 'neutral' | 'negative' {
  const strVal = typeof value === 'string' ? value.toLowerCase() : ''
  if (title.toLowerCase().includes('recall')) {
    if (strVal === 'strong') return 'positive'
    if (strVal === 'fair') return 'neutral'
    if (strVal === 'weak' || strVal === 'unknown') return 'negative'
  }
  if (title.toLowerCase().includes('accuracy')) {
    const num = typeof value === 'number' ? value : Number.parseFloat(strVal)
    if (num >= 70) return 'positive'
    if (num >= 50) return 'neutral'
    return 'negative'
  }
  if (title.toLowerCase().includes('drop')) {
    if (strVal === 'low') return 'positive'
    if (strVal === 'medium') return 'neutral'
    if (strVal === 'high' || strVal === 'unknown') return 'negative'
  }
  if (
    title.toLowerCase().includes('engagement') ||
    title.toLowerCase().includes('trend')
  ) {
    if (strVal === 'growing') return 'positive'
    if (strVal === 'stable') return 'neutral'
    if (strVal === 'declining' || strVal === 'unknown') return 'negative'
  }
  return 'neutral'
}

function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    return `${Math.round(value)}%`
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function TopicHealthCard({
  icon: Icon,
  title,
  value,
  supportingText,
  sentiment,
  loading,
  className,
}: TopicHealthCardProps) {
  if (loading) return <TopicHealthCardSkeleton />

  const derivedSentiment = sentiment ?? deriveSentiment(title, value)
  const styles = sentimentStyles[derivedSentiment] ?? defaultSentiment

  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        styles.bg,
        styles.border,
        className,
      )}
    >
      <div className='flex items-center justify-between'>
        <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
          {title}
        </span>
        <div
          className={cn(
            'flex size-8 items-center justify-center rounded-lg transition-colors',
            styles.icon,
          )}
        >
          <Icon className='size-4' />
        </div>
      </div>
      <span
        className={cn(
          'font-semibold text-2xl tabular-nums tracking-tight',
          styles.text,
        )}
      >
        {formatValue(value)}
      </span>
      <span className='text-slate-500 text-xs'>{supportingText}</span>
    </div>
  )
}

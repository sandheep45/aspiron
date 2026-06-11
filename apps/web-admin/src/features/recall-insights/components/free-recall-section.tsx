import type { FreeRecallResponse } from '@aspiron/api-client'
import { FileText, MessageSquare, TrendingUp } from 'lucide-react'
import { MissingConceptSkeleton } from '@/features/recall-insights/components/loading-skeleton'
import { MissingConceptCard } from '@/features/recall-insights/components/missing-concept-card'
import { cn } from '@/lib/utils'

interface FreeRecallSectionProps {
  data: FreeRecallResponse | undefined
  loading?: boolean
  className?: string
}

export function FreeRecallSection({
  data,
  loading,
  className,
}: FreeRecallSectionProps) {
  if (loading) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <MissingConceptSkeleton />
      </div>
    )
  }

  if (!data) return null

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Participation Rate',
      value: `${Math.round(data.participation_rate)}%`,
    },
    {
      icon: MessageSquare,
      label: 'AI Clarity Score',
      value: `${Math.round(data.ai_clarity_score)}%`,
    },
    {
      icon: FileText,
      label: 'Avg Response Length',
      value: `${data.average_response_length} chars`,
    },
  ]

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className='grid gap-3 sm:grid-cols-3'>
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className='flex flex-col gap-2 rounded-xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 backdrop-blur-sm'
            >
              <span className='font-medium text-[0.65rem] text-slate-400 uppercase tracking-wider'>
                {metric.label}
              </span>
              <span className='font-semibold text-2xl text-white tabular-nums tracking-tight'>
                {metric.value}
              </span>
              <div className='flex items-center gap-1.5 text-[0.65rem] text-slate-500'>
                <Icon className='size-3' />
                <span>Free recall analytics</span>
              </div>
            </div>
          )
        })}
      </div>

      {data.missing_concepts.length > 0 && (
        <div className='flex flex-col gap-3'>
          <h3 className='font-medium text-slate-400 text-xs uppercase tracking-wider'>
            Common Missing Concepts
          </h3>
          <div className='space-y-3'>
            {data.missing_concepts.map((concept, i) => (
              <MissingConceptCard
                key={concept.concept}
                concept={concept}
                rank={i + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

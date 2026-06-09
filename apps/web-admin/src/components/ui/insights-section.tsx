import type { InsightItem } from '@aspiron/api-client'
import { InsightCard } from '@/components/ui/insight-card'

interface InsightsSectionProps {
  insights: InsightItem[]
}

export function InsightsSection({ insights }: InsightsSectionProps) {
  if (insights.length === 0) {
    return null
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {insights.map((insight) => (
        <InsightCard
          key={insight.id}
          type={insight.type}
          title={insight.title}
          description={insight.description}
        />
      ))}
    </div>
  )
}

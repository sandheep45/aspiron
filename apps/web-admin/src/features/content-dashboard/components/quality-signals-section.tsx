import type { ContentDashboardSignalItem } from '@aspiron/api-client'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { SignalCard } from '@/features/content-dashboard/components/signal-card'

interface QualitySignalsSectionProps {
  highestRecall: ContentDashboardSignalItem[]
  fastestDecay: ContentDashboardSignalItem[]
  loading?: boolean
}

export function QualitySignalsSection({
  highestRecall,
  fastestDecay,
  loading,
}: QualitySignalsSectionProps) {
  return (
    <section>
      <SectionHeader
        title='Content Quality Signals'
        description='Surface positive and negative content trends.'
        accent='bg-fuchsia-500'
      />

      <div className='grid gap-6 md:grid-cols-2'>
        <SignalCard
          title='Topics With Highest Recall'
          description='Topics showing strongest retention.'
          icon={TrendingUp}
          items={highestRecall}
          valueKey='score'
          loading={loading}
        />
        <SignalCard
          title='Topics With Fastest Recall Decay'
          description='Topics losing retention fastest.'
          icon={TrendingDown}
          items={fastestDecay}
          valueKey='drop'
          loading={loading}
        />
      </div>
    </section>
  )
}

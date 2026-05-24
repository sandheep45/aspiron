import { useInsightQuery } from '@aspiron/tanstack-client'
import { InsightCard } from '@/features/dashboard/components/insight-card'

export function ActionRequired() {
  const { data } = useInsightQuery({
    args: {},
  })

  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-2'>
        <div className='h-6 w-1 rounded-full bg-linear-to-b from-rose-500 to-orange-500' />
        <h2 className='font-semibold text-white text-xl'>Action Required</h2>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        {data?.insights.map((insight) => (
          <InsightCard insight={insight} key={insight.id} />
        ))}
      </div>
    </div>
  )
}

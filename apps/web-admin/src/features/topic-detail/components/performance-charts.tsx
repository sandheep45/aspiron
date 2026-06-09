import type { TopicTrends, TrendDataPoint } from '@aspiron/api-client'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendsSkeleton } from '@/features/topic-detail/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface PerformanceChartsProps {
  data: TopicTrends | null
  loading?: boolean
  className?: string
}

interface ChartSection {
  title: string
  data: TrendDataPoint[]
  color: string
  trend: 'up' | 'down' | 'stable'
}

function getTrend(data: TrendDataPoint[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable'
  const first = data[0].value
  const last = data[data.length - 1].value
  const diff = last - first
  if (Math.abs(diff) < 2) return 'stable'
  return diff > 0 ? 'up' : 'down'
}

function TrendChart({ title, data, color, trend }: ChartSection) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
          {title}
        </span>
        <TrendIcon
          className={cn(
            'size-4',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'stable' && 'text-slate-400',
          )}
        />
      </div>

      <div className='h-48'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(255,255,255,0.05)'
            />
            <XAxis
              dataKey='date'
              tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              tick={{ fill: 'rgba(148,163,184,0.5)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'rgba(148,163,184,0.8)' }}
            />
            <Line
              type='monotone'
              dataKey='value'
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function PerformanceCharts({
  data,
  loading,
  className,
}: PerformanceChartsProps) {
  if (loading) return <TrendsSkeleton />

  if (!data) return null

  const sections: ChartSection[] = [
    {
      title: 'Recall Trend',
      data: data.recall_trend,
      color: '#818cf8',
      trend: getTrend(data.recall_trend),
    },
    {
      title: 'Practice Accuracy Trend',
      data: data.practice_accuracy_trend,
      color: '#34d399',
      trend: getTrend(data.practice_accuracy_trend),
    },
    {
      title: 'Engagement Trend',
      data: data.engagement_trend,
      color: '#f59e0b',
      trend: getTrend(data.engagement_trend),
    },
    {
      title: 'Completion Trend',
      data: data.completion_trend,
      color: '#10b981',
      trend: getTrend(data.completion_trend),
    },
  ]

  const hasData = sections.some((s) => s.data.length > 0)
  if (!hasData) return null

  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      {sections.map((section) => (
        <TrendChart key={section.title} {...section} />
      ))}
    </div>
  )
}

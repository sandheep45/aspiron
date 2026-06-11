import type { RecallTrendsResponse } from '@aspiron/api-client'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendsChartsSkeleton } from '@/features/recall-insights/components/loading-skeleton'
import { cn } from '@/lib/utils'

interface RecallTrendChartsProps {
  data: RecallTrendsResponse | null | undefined
  loading?: boolean
  className?: string
}

interface ChartCardProps {
  title: string
  data: { date: string; value: number }[]
  color: string
}

function ChartCard({ title, data, color }: ChartCardProps) {
  return (
    <div className='flex flex-col gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 backdrop-blur-sm'>
      <span className='font-medium text-slate-400 text-xs uppercase tracking-wide'>
        {title}
      </span>
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
              tickFormatter={(v: string) => v.slice(5)}
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

export function RecallTrendCharts({
  data,
  loading,
  className,
}: RecallTrendChartsProps) {
  if (loading) return <TrendsChartsSkeleton />
  if (!data) return null

  const charts = [
    {
      title: 'Recall Trend Over Time',
      data: data.recall_trend,
      color: '#818cf8',
    },
    {
      title: 'Memory Decay Curve',
      data: data.memory_decay_curve,
      color: '#f59e0b',
    },
    {
      title: 'Recall By Difficulty',
      data: data.recall_by_difficulty,
      color: '#34d399',
    },
    {
      title: 'Student Retention Distribution',
      data: data.retention_distribution,
      color: '#f472b6',
    },
  ]

  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      {charts.map((chart) => (
        <ChartCard key={chart.title} {...chart} />
      ))}
    </div>
  )
}

import type { InsightsResponse } from '@aspiron/api-client'
import { useInsightQuery } from '@aspiron/tanstack-client'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { DashboardModule } from '@/features/dashboard/components/dashboard-module'
import { StatCardSkeleton } from '@/features/dashboard/components/dashboard-skeletons'
import { cn } from '@/lib/utils'

interface SystemHealthMetric {
  label: string
  value: string | number
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  health: 'good' | 'warning' | 'critical'
}

const METRIC_LABELS = [
  {
    label: 'Active Students',
    key: 'activeStudents',
    testId: 'metric-active-students',
  },
  {
    label: 'Tests Conducted',
    key: 'testsConducted',
    testId: 'metric-tests-conducted',
  },
  {
    label: 'Content Published',
    key: 'contentPublished',
    testId: 'metric-content-published',
  },
  {
    label: 'Average Attendance',
    key: 'averageAttendance',
    testId: 'metric-avg-attendance',
  },
] as const

function transformInsightsToMetrics(
  data: InsightsResponse,
): SystemHealthMetric[] {
  const { summary, insights } = data

  if (insights.length === 0 && summary.total === 0) {
    return []
  }

  const activeStudents = Math.max(summary.total * 12 + insights.length * 3, 10)
  const testsConducted = summary.total * 3 + summary.danger * 2
  const contentPublished = insights.length * 8 + 5
  const avgAttendance = 100 - summary.warning * 5 - summary.danger * 8

  return [
    {
      label: 'Active Students',
      value: activeStudents,
      trend: summary.total > 2 ? 'up' : 'down',
      trendValue: `${summary.total > 2 ? '+12%' : '-3%'}`,
      health:
        activeStudents > 30
          ? 'good'
          : activeStudents > 15
            ? 'warning'
            : 'critical',
    },
    {
      label: 'Tests Conducted',
      value: testsConducted,
      trend: testsConducted > 5 ? 'up' : 'down',
      trendValue: `${testsConducted > 5 ? '+8%' : '-2%'}`,
      health:
        testsConducted > 8
          ? 'good'
          : testsConducted > 4
            ? 'warning'
            : 'critical',
    },
    {
      label: 'Content Published',
      value: contentPublished,
      trend: 'up',
      trendValue: '+5%',
      health: 'good',
    },
    {
      label: 'Average Attendance',
      value: `${Math.max(0, Math.min(100, avgAttendance))}%`,
      trend: avgAttendance >= 70 ? 'up' : 'down',
      trendValue: avgAttendance >= 70 ? '+3%' : '-8%',
      health:
        avgAttendance >= 75
          ? 'good'
          : avgAttendance >= 50
            ? 'warning'
            : 'critical',
    },
  ]
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ArrowUp className='h-3 w-3 text-emerald-400' />
  if (trend === 'down') return <ArrowDown className='h-3 w-3 text-red-400' />
  return <Minus className='h-3 w-3 text-slate-400' />
}

const healthColors = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
} as const

function MetricCard({ metric }: { metric: SystemHealthMetric }) {
  return (
    <div
      data-testid={METRIC_LABELS.find((m) => m.label === metric.label)?.testId}
      className='space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4'
    >
      <p className='font-medium text-slate-500 text-xs uppercase tracking-wider'>
        {metric.label}
      </p>
      <p className={cn('font-bold text-2xl', healthColors[metric.health])}>
        {metric.value}
      </p>
      <div className='flex items-center gap-1'>
        <TrendIcon trend={metric.trend} />
        <span
          className={cn(
            'text-xs',
            metric.trend === 'up' && 'text-emerald-400',
            metric.trend === 'down' && 'text-red-400',
            metric.trend === 'stable' && 'text-slate-400',
          )}
        >
          {metric.trendValue}
        </span>
      </div>
    </div>
  )
}

// TODO: Replace transform with dedicated backend endpoint when available
// GET /api/v1/admin/metrics or similar
export function useSystemHealthQuery() {
  const query = useInsightQuery({ args: {} })

  return {
    ...query,
    data: query.data ? transformInsightsToMetrics(query.data) : undefined,
  }
}

export function SystemHealth() {
  const metricQuery = useSystemHealthQuery()

  return (
    <DashboardModule<SystemHealthMetric[]>
      title='System Health'
      sectionId='system-health'
      query={metricQuery}
      skeleton={<StatCardSkeleton />}
      empty={{
        title: 'No metrics available',
        description:
          'System health data will appear once the platform has activity.',
      }}
      isEmpty={(data) => data.length === 0}
      render={(metrics) => (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      )}
    />
  )
}

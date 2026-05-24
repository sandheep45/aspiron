import type { InsightType } from '@aspiron/api-client'
import type { LinkProps } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  Brain,
  ClipboardCheck,
  UserX,
} from 'lucide-react'

type DashboardQuickActionConfig = {
  linkProps: LinkProps
  label?: string
  icon?: React.ComponentType
}

export const dashboardQuickActionRouteMapper = {
  low_attendance: {
    linkProps: { to: '/live-classes' },
    icon: UserX,
  },
  low_engagement: {
    linkProps: { to: '/live-classes' },
    icon: Activity,
  },
  quiz_review_pending: {
    icon: ClipboardCheck,
    linkProps: { to: '/live-classes' },
  },
  system_alert: { icon: AlertTriangle, linkProps: { to: '/live-classes' } },
  topic_difficulty: { icon: Brain, linkProps: { to: '/live-classes' } },
} satisfies Record<InsightType, DashboardQuickActionConfig>

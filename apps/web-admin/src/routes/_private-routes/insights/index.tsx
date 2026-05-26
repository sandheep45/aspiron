import { createFileRoute } from '@tanstack/react-router'
import { InsightsPage } from '@/features/insights'

export const Route = createFileRoute('/_private-routes/insights/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Insights',
  },
})

function RouteComponent() {
  return <InsightsPage />
}

import { createFileRoute } from '@tanstack/react-router'
import { ContentDashboardPage } from '@/features/content-dashboard/components/content-dashboard-page'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <ContentDashboardPage />
}

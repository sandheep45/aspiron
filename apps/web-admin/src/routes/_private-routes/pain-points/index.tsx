import { createFileRoute } from '@tanstack/react-router'
import { PainPointsPage } from '@/features/insights'

export const Route = createFileRoute('/_private-routes/pain-points/')({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Pain Points',
  },
})

function RouteComponent() {
  return <PainPointsPage />
}

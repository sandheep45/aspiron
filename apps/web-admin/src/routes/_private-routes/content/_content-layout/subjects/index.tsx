import { createFileRoute } from '@tanstack/react-router'
import { SubjectsPage } from '@/features/subjects-page/components/subjects-page'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/subjects/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <SubjectsPage />
}

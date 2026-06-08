import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SubjectsPage } from '@/features/subjects-page/components/subjects-page'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/subjects/',
)({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'Subjects',
  },
})

function RouteComponent() {
  const navigate = useNavigate()

  return (
    <SubjectsPage
      onViewChapters={(subjectId) =>
        navigate({
          to: '/content/subjects/$subjectId/chapters',
          params: { subjectId },
        })
      }
    />
  )
}

import { chaptersPageService } from '@aspiron/api-client'
import { createFileRoute } from '@tanstack/react-router'
import { ChaptersPage } from '@/features/chapters-page/components/chapters-page'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/subjects/$subjectId/chapters/',
)({
  loader: async ({ params }) => {
    try {
      const summary = await chaptersPageService.getSubjectSummary({
        args: { subjectId: params.subjectId },
      })
      return { breadcrumb: summary.subject_name }
    } catch {
      return { breadcrumb: 'Chapters' }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <ChaptersPage />
}

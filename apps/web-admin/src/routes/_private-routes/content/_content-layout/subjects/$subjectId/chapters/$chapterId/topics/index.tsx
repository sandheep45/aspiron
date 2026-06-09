import { topicsPageService } from '@aspiron/api-client'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { TopicsPage } from '@/features/topics-page/components/topics-page'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/subjects/$subjectId/chapters/$chapterId/topics/',
)({
  loader: async ({ params }) => {
    try {
      const summary = await topicsPageService.getChapterSummary({
        args: { chapterId: params.chapterId },
      })
      return {
        breadcrumb: 'Topics',
        parentBreadcrumb: summary.chapter_name,
        parentPath: `/content/subjects/${params.subjectId}/chapters/${params.chapterId}/`,
      }
    } catch {
      return { breadcrumb: 'Topics' }
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { subjectId } = useParams({
    from: '/_private-routes/content/_content-layout/subjects/$subjectId/chapters/$chapterId/topics/',
  })

  return (
    <TopicsPage
      onBack={() =>
        navigate({
          to: '/content/subjects/$subjectId/chapters',
          params: { subjectId },
        })
      }
      onViewTopic={(topicId) =>
        navigate({
          to: '/content/topic/$topicId',
          params: { topicId },
        })
      }
    />
  )
}

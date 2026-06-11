import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TopicDetailPage } from '@/features/topic-detail'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/topic/$id/',
)({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    const data = await queryClient.ensureQueryData({
      queryKey: ['getTopicById', params.id],
      queryFn: () =>
        contentTopicService.getTopicById({
          args: { topicId: params.id },
        }),
    })

    return {
      subjectId: data.subject_id,
      chapterId: data.chapter_id,
      topicName: data.name,
      breadcrumb: data.name,
      parentBreadcrumbs: [
        {
          label: data.subject_name,
          href: `/content/subjects`,
        },
        {
          label: data.chapter_name,
          href: `/content/subjects/${data.subject_id}/chapters`,
        },
      ],
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { subjectId, chapterId, topicName } = Route.useLoaderData()

  const handleBack = () => {
    navigate({
      to: '/content/subjects/$subjectId/chapters/$chapterId/topics',
      params: { subjectId, chapterId },
    })
  }

  const componentRoutes: Record<string, string> = {
    'study-notes': '/content/topic/$id/notes',
    'practice-questions': '/content/topic/$id/practice-tests',
  }

  const handleActionClick = (componentId: string) => {
    const route = componentRoutes[componentId]
    if (route) {
      navigate({ to: route, params: { id } })
    }
  }

  return (
    <TopicDetailPage
      topicId={id}
      topicName={topicName}
      onBack={handleBack}
      onActionClick={handleActionClick}
    />
  )
}

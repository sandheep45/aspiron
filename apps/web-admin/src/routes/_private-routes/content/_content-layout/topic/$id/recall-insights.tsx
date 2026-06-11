import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { RecallInsightsPage } from '@/features/recall-insights'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/topic/$id/recall-insights',
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
      topicId: params.id,
      topicName: data.name,
      breadcrumb: 'Recall Insights',
      parentBreadcrumbs: [
        {
          label: data.subject_name,
          href: `/content/subjects`,
        },
        {
          label: data.chapter_name,
          href: `/content/subjects/${data.subject_id}/chapters`,
        },
        {
          label: data.name,
          href: `/content/topic/${params.id}`,
        },
      ],
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { topicId } = Route.useLoaderData()

  const handleBack = () => {
    navigate({ to: '/content/topic/$id', params: { id: topicId } })
  }

  return <RecallInsightsPage topicId={topicId} onBack={handleBack} />
}

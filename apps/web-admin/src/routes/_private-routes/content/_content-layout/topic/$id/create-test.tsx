import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CreateTestPage } from '@/features/create-test'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/topic/$id/create-test',
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
      breadcrumb: 'Create Test',
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
        {
          label: 'Practice & Tests',
          href: `/content/topic/${params.id}/practice-tests`,
        },
      ],
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { topicId } = Route.useLoaderData()

  const handleBack = () => {
    navigate({
      to: '/content/topic/$id/practice-tests',
      params: { id: topicId },
    })
  }

  return <CreateTestPage topicId={topicId} onBack={handleBack} />
}

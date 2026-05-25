import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/topic/$id',
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
      breadcrumb: data.name,
    }
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/content/topic/$id"!</div>
}

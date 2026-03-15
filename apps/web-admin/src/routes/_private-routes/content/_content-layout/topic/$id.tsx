import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/topic/$id',
)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { name } = await contentTopicService.getTopicById({
      args: {
        topicId: params.id,
      },
    })

    return {
      breadcrumb: name,
    }
  },
})

function RouteComponent() {
  return <div>Hello "/_private-routes/content/topic/$id"!</div>
}

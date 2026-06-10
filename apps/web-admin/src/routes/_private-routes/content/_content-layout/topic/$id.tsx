import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute, Outlet } from '@tanstack/react-router'

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
      subjectId: data.subject_id,
      chapterId: data.chapter_id,
      topicName: data.name,
    }
  },
})

function RouteComponent() {
  return <Outlet />
}

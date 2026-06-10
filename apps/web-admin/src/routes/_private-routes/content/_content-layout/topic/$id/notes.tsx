import { contentTopicService } from '@aspiron/api-client'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { NotesManagerPage } from '@/features/notes-manager'

export const Route = createFileRoute(
  '/_private-routes/content/_content-layout/topic/$id/notes',
)({
  component: RouteComponent,
  loader: async ({ params, context: { queryClient } }) => {
    const _data = await queryClient.ensureQueryData({
      queryKey: ['getTopicById', params.id],
      queryFn: () =>
        contentTopicService.getTopicById({
          args: { topicId: params.id },
        }),
    })

    return {
      topicId: params.id,
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { topicId } = Route.useLoaderData()

  const handleBack = () => {
    navigate({ to: '/content/topic/$id', params: { id: topicId } })
  }

  return <NotesManagerPage topicId={topicId} onBack={handleBack} />
}

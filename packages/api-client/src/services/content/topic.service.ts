import { getClient } from '@/client/axios-instance'
import type { TopicDto } from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const contentTopicService = {
  getTopicById: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TopicDto> => {
    const client = getClient(options)
    const response = await client.get<TopicDto>(`/topics/${args?.topicId}`)

    return response.data
  },
}

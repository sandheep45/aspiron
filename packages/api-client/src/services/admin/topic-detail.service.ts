import { getClient } from '@/client/axios-instance'
import type {
  TopicAction,
  TopicComponent,
  TopicIssue,
  TopicOverview,
  TopicTrends,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const topicDetailService = {
  getOverview: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TopicOverview> => {
    const client = getClient(options)
    const response = await client.get<TopicOverview>(
      `/topics/${args?.topicId}/overview`,
    )
    return response.data
  },

  getIssues: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TopicIssue[]> => {
    const client = getClient(options)
    const response = await client.get<TopicIssue[]>(
      `/topics/${args?.topicId}/issues`,
    )
    return response.data
  },

  getComponents: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<
    TopicComponent[]
  > => {
    const client = getClient(options)
    const response = await client.get<TopicComponent[]>(
      `/topics/${args?.topicId}/components`,
    )
    return response.data
  },

  getActions: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TopicAction[]> => {
    const client = getClient(options)
    const response = await client.get<TopicAction[]>(
      `/topics/${args?.topicId}/actions`,
    )
    return response.data
  },

  getTrends: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<TopicTrends | null> => {
    const client = getClient(options)
    const response = await client.get<TopicTrends | null>(
      `/topics/${args?.topicId}/trends`,
    )
    return response.data
  },
}

import { getClient } from '@/client/axios-instance'
import type {
  FreeRecallResponse,
  McqRecallResponse,
  MemoryGapMapResponse,
  RecallOverview,
  RecallTrendsResponse,
  SuggestedActionItem,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const recallInsightsService = {
  getOverview: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<RecallOverview> => {
    const client = getClient(options)
    const response = await client.get<RecallOverview>(
      `/topics/${args?.topicId}/recall/overview`,
    )
    return response.data
  },

  getMcqRecall: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<McqRecallResponse> => {
    const client = getClient(options)
    const response = await client.get<McqRecallResponse>(
      `/topics/${args?.topicId}/recall/mcq`,
    )
    return response.data
  },

  getFreeRecall: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<FreeRecallResponse> => {
    const client = getClient(options)
    const response = await client.get<FreeRecallResponse>(
      `/topics/${args?.topicId}/recall/free-response`,
    )
    return response.data
  },

  getMemoryGaps: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<MemoryGapMapResponse> => {
    const client = getClient(options)
    const response = await client.get<MemoryGapMapResponse>(
      `/topics/${args?.topicId}/recall/gaps`,
    )
    return response.data
  },

  getActions: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<SuggestedActionItem[]> => {
    const client = getClient(options)
    const response = await client.get<SuggestedActionItem[]>(
      `/topics/${args?.topicId}/recall/actions`,
    )
    return response.data
  },

  getTrends: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<RecallTrendsResponse | null> => {
    const client = getClient(options)
    const response = await client.get<RecallTrendsResponse | null>(
      `/topics/${args?.topicId}/recall/trends`,
    )
    return response.data
  },
}

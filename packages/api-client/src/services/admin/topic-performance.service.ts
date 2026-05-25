import { getClient } from '@/client/axios-instance'
import type {
  TopicPerformanceQueryParams,
  TopicPerformanceResponse,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const adminTopicPerformanceService = {
  getTopicPerformance: async ({
    args,
    options,
  }: ServiceMethodArguments<TopicPerformanceQueryParams>): Promise<TopicPerformanceResponse> => {
    const client = getClient(options)
    const response = await client.get<TopicPerformanceResponse>(
      '/admin/insights/topics',
      {
        params: {
          ...(args?.page && { page: args.page }),
          ...(args?.limit && { limit: args.limit }),
          ...(args?.search && { search: args.search }),
          ...(args?.subject_id && { subject_id: args.subject_id }),
          ...(args?.chapter_id && { chapter_id: args.chapter_id }),
          ...(args?.topic_id && { topic_id: args.topic_id }),
          ...(args?.sort_by && { sort_by: args.sort_by }),
          ...(args?.sort_order && { sort_order: args.sort_order }),
        },
      },
    )
    return response.data
  },
}

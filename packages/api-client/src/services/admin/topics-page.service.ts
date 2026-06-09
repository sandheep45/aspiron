import { getClient } from '@/client/axios-instance'
import type {
  InsightItem,
  TopicItem,
  TopicSummary,
  TopicsQueryParams,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const topicsPageService = {
  getChapterSummary: async ({
    options,
    args,
  }: ServiceMethodArguments<{
    chapterId: string
  }>): Promise<TopicSummary> => {
    const client = getClient(options)
    const response = await client.get<TopicSummary>(
      `/chapters/${args?.chapterId}/topics-page/summary`,
    )
    return response.data
  },

  getTopics: async ({
    options,
    args,
  }: ServiceMethodArguments<
    { chapterId: string } & TopicsQueryParams
  >): Promise<TopicItem[]> => {
    const client = getClient(options)
    const response = await client.get<TopicItem[]>(
      `/chapters/${args?.chapterId}/topics-page/topics`,
      {
        params: {
          ...(args?.search && { search: args.search }),
          ...(args?.sort_by && { sort_by: args.sort_by }),
          ...(args?.sort_order && { sort_order: args.sort_order }),
          ...(args?.page && { page: args.page }),
          ...(args?.limit && { limit: args.limit }),
          ...(args?.status_filter && { status_filter: args.status_filter }),
          ...(args?.content_status_filter && {
            content_status_filter: args.content_status_filter,
          }),
          ...(args?.recall_filter && { recall_filter: args.recall_filter }),
          ...(args?.video_filter && { video_filter: args.video_filter }),
        },
      },
    )
    return response.data
  },

  getInsights: async ({
    options,
    args,
  }: ServiceMethodArguments<{
    chapterId: string
  }>): Promise<InsightItem[]> => {
    const client = getClient(options)
    const response = await client.get<InsightItem[]>(
      `/chapters/${args?.chapterId}/topics-page/insights`,
    )
    return response.data
  },
}

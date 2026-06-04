import { getClient } from '@/client/axios-instance'
import type {
  AttentionQueryParams,
  ContentDashboardAttentionResponse,
  ContentDashboardSignalItem,
  ContentDashboardSubjectProgress,
  ContentDashboardSummary,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const contentDashboardService = {
  getSummary: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<ContentDashboardSummary> => {
    const client = getClient(options)
    const response = await client.get<ContentDashboardSummary>(
      '/content/dashboard/summary',
    )
    return response.data
  },

  getAttention: async ({
    args,
    options,
  }: ServiceMethodArguments<AttentionQueryParams>): Promise<ContentDashboardAttentionResponse> => {
    const client = getClient(options)
    const response = await client.get<ContentDashboardAttentionResponse>(
      '/content/dashboard/attention',
      { params: { ...args } },
    )
    return response.data
  },

  getSubjects: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<
    ContentDashboardSubjectProgress[]
  > => {
    const client = getClient(options)
    const response = await client.get<ContentDashboardSubjectProgress[]>(
      '/content/dashboard/subjects',
    )
    return response.data
  },

  getSignals: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<{
    highest_recall: ContentDashboardSignalItem[]
    fastest_decay: ContentDashboardSignalItem[]
  }> => {
    const client = getClient(options)
    const response = await client.get<{
      highest_recall: ContentDashboardSignalItem[]
      fastest_decay: ContentDashboardSignalItem[]
    }>('/content/dashboard/signals')
    return response.data
  },
}

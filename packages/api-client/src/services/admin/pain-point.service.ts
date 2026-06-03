import { getClient } from '@/client/axios-instance'
import type {
  CriticalIssuesResponse,
  PainPointQueryParams,
  PainPointsResponse,
  PatternInsightsResponse,
  TopicDetailResponse,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const adminPainPointService = {
  getCriticalIssues: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<CriticalIssuesResponse> => {
    const client = getClient(options)
    const response = await client.get<CriticalIssuesResponse>(
      '/admin/insights/pain-points/critical',
    )
    return response.data
  },

  getPainPoints: async ({
    args,
    options,
  }: ServiceMethodArguments<PainPointQueryParams>): Promise<PainPointsResponse> => {
    const client = getClient(options)
    const response = await client.get<PainPointsResponse>(
      '/admin/insights/pain-points',
      {
        params: {
          ...(args?.page && { page: args.page }),
          ...(args?.limit && { limit: args.limit }),
          ...(args?.search && { search: args.search }),
          ...(args?.subject && { subject: args.subject }),
          ...(args?.severity && { severity: args.severity }),
          ...(args?.status && { status: args.status }),
          ...(args?.sort_by && { sort_by: args.sort_by }),
          ...(args?.sort_order && { sort_order: args.sort_order }),
        },
      },
    )
    return response.data
  },

  getPatternInsights: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<PatternInsightsResponse> => {
    const client = getClient(options)
    const response = await client.get<PatternInsightsResponse>(
      '/admin/insights/pain-points/insights',
    )
    return response.data
  },

  getTopicDetail: async ({
    args,
    options,
  }: ServiceMethodArguments<{ id: string }> & {
    args: { id: string }
  }): Promise<TopicDetailResponse> => {
    const client = getClient(options)
    const response = await client.get<TopicDetailResponse>(
      `/admin/insights/pain-points/${args.id}`,
    )
    return response.data
  },
}

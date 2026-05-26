import { getClient } from '@/client/axios-instance'
import type { InsightsQueryParams, InsightsResponse } from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const adminInsightService = {
  getInsights: async ({
    args,
    options,
  }: ServiceMethodArguments<InsightsQueryParams>): Promise<InsightsResponse> => {
    const client = getClient(options)
    const response = await client.get<InsightsResponse>('/admin/insights', {
      params: {
        ...(args?.page && { page: args.page }),
        ...(args?.limit && { limit: args.limit }),
        ...(args?.sort_by && { sort_by: args.sort_by }),
        ...(args?.sort_order && { sort_order: args.sort_order }),
        ...(args?.severity && { severity: args.severity }),
        ...(args?.insight_type && { insight_type: args.insight_type }),
        ...(args?.start && { start: args.start.toString() }),
        ...(args?.end && { end: args.end.toString() }),
      },
    })
    return response.data
  },
}

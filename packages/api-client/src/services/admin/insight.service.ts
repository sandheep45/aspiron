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
        ...(args?.start && { start: args.start.toString() }),
        ...(args?.end && { end: args.end.toString() }),
      },
    })
    return response.data
  },
}

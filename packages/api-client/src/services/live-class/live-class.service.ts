import { getClient } from '@/client/axios-instance'
import type { LiveClassesResponse } from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export interface GetUpcomingClassesArgs {
  page?: number
  limit?: number
}

export const liveClassService = {
  getUpcomingClasses: async ({
    options,
    args,
  }: ServiceMethodArguments<GetUpcomingClassesArgs>): Promise<LiveClassesResponse> => {
    const client = getClient(options)
    const response = await client.get<LiveClassesResponse>(
      '/live/classes/upcoming',
      { params: { page: args?.page, limit: args?.limit } },
    )
    return response.data
  },
}

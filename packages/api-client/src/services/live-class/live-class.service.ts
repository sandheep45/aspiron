import { getClient } from '@/client/axios-instance'
import type { LiveClassResponse } from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

type EmptyArgs = Record<string, never>

export const liveClassService = {
  getUpcomingClasses: async ({
    options,
  }: ServiceMethodArguments<EmptyArgs>): Promise<LiveClassResponse[]> => {
    const client = getClient(options)
    const response = await client.get<LiveClassResponse[]>(
      '/live/classes/upcoming',
    )
    return response.data
  },
}

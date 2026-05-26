import {
  type AxiosConfigOptions,
  adminTopicPerformanceService,
  type TopicPerformanceQueryParams,
  type TopicPerformanceResponse,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseTopicPerformanceQueryOptions
  extends Omit<
    UseQueryOptions<TopicPerformanceResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args?: TopicPerformanceQueryParams
}

export const useTopicPerformanceQuery = (
  options?: UseTopicPerformanceQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.topicPerformance(), options?.args ?? {}],
    queryFn: () => {
      return adminTopicPerformanceService.getTopicPerformance({
        options: { axiosConfig },
        args: options?.args,
      })
    },
  })
}

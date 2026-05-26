import {
  type AxiosConfigOptions,
  adminInsightService,
  type InsightsQueryParams,
  type InsightsResponse,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseInsightQueryOptions
  extends Omit<
    UseQueryOptions<InsightsResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args?: InsightsQueryParams
}

export const useInsightQuery = (options?: UseInsightQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.insights(), options?.args ?? {}],
    queryFn: () => {
      return adminInsightService.getInsights({
        options: { axiosConfig },
        args: options?.args,
      })
    },
  })
}

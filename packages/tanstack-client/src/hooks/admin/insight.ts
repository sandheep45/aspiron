import {
  type AxiosConfigOptions,
  adminInsightServive,
  type InsightsQueryParams,
  type InsightsResponse,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useAxiosConfig } from '@/providers/QueryProvider'
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
  const providerAxiosConfig = useAxiosConfig()
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.insights()],
    queryFn: () => {
      const config = options?.axiosConfig || providerAxiosConfig || undefined
      return adminInsightServive.getInsightsc({
        options: { axiosConfig: config },
        args: options?.args,
      })
    },
  })
}

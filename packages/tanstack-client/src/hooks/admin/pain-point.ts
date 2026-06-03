import {
  type AxiosConfigOptions,
  adminPainPointService,
  type CriticalIssuesResponse,
  type PainPointQueryParams,
  type PainPointsResponse,
  type PatternInsightsResponse,
  type TopicDetailResponse,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseCriticalIssuesQueryOptions
  extends Omit<
    UseQueryOptions<CriticalIssuesResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useCriticalIssuesQuery = (
  options?: UseCriticalIssuesQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.painPointsCritical()],
    queryFn: () => {
      return adminPainPointService.getCriticalIssues({
        options: { axiosConfig },
      })
    },
  })
}

export interface UsePainPointsQueryOptions
  extends Omit<
    UseQueryOptions<PainPointsResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args?: PainPointQueryParams
}

export const usePainPointsQuery = (options?: UsePainPointsQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.painPoints(), options?.args ?? {}],
    queryFn: () => {
      return adminPainPointService.getPainPoints({
        options: { axiosConfig },
        args: options?.args,
      })
    },
  })
}

export interface UsePatternInsightsQueryOptions
  extends Omit<
    UseQueryOptions<PatternInsightsResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const usePatternInsightsQuery = (
  options?: UsePatternInsightsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.painPointsInsights()],
    queryFn: () => {
      return adminPainPointService.getPatternInsights({
        options: { axiosConfig },
      })
    },
  })
}

export interface UseTopicDetailQueryOptions
  extends Omit<
    UseQueryOptions<TopicDetailResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { id: string }
}

export const useTopicDetailQuery = (options: UseTopicDetailQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.admin.painPointsTopicDetail(options.args.id)],
    queryFn: () => {
      return adminPainPointService.getTopicDetail({
        options: { axiosConfig },
        args: options.args,
      })
    },
    enabled: !!options.args.id,
  })
}

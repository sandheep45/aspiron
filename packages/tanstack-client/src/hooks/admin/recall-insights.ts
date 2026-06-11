import {
  type AxiosConfigOptions,
  type FreeRecallResponse,
  type McqRecallResponse,
  type MemoryGapMapResponse,
  type RecallOverview,
  type RecallTrendsResponse,
  recallInsightsService,
  type SuggestedActionItem,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseRecallOverviewQueryOptions
  extends Omit<UseQueryOptions<RecallOverview, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useRecallOverviewQuery = (
  options: UseRecallOverviewQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.recallInsights.overview(options.args.topicId)],
    queryFn: () =>
      recallInsightsService.getOverview({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseMcqRecallQueryOptions
  extends Omit<
    UseQueryOptions<McqRecallResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useMcqRecallQuery = (options: UseMcqRecallQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.recallInsights.mcq(options.args.topicId)],
    queryFn: () =>
      recallInsightsService.getMcqRecall({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseFreeRecallQueryOptions
  extends Omit<
    UseQueryOptions<FreeRecallResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useFreeRecallQuery = (options: UseFreeRecallQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.recallInsights.freeRecall(options.args.topicId)],
    queryFn: () =>
      recallInsightsService.getFreeRecall({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseMemoryGapMapQueryOptions
  extends Omit<
    UseQueryOptions<MemoryGapMapResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useMemoryGapMapQuery = (options: UseMemoryGapMapQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.recallInsights.gaps(options.args.topicId)],
    queryFn: () =>
      recallInsightsService.getMemoryGaps({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseSuggestedActionsQueryOptions
  extends Omit<
    UseQueryOptions<SuggestedActionItem[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useSuggestedActionsQuery = (
  options: UseSuggestedActionsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.recallInsights.actions(options.args.topicId)],
    queryFn: () =>
      recallInsightsService.getActions({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseRecallTrendsQueryOptions
  extends Omit<
    UseQueryOptions<RecallTrendsResponse | null, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useRecallTrendsQuery = (options: UseRecallTrendsQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.recallInsights.trends(options.args.topicId)],
    queryFn: () =>
      recallInsightsService.getTrends({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

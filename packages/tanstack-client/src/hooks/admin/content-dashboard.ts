import {
  type AttentionQueryParams,
  type AxiosConfigOptions,
  type ContentDashboardAttentionResponse,
  type ContentDashboardSignalItem,
  type ContentDashboardSubjectProgress,
  type ContentDashboardSummary,
  contentDashboardService,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseContentSummaryQueryOptions
  extends Omit<
    UseQueryOptions<ContentDashboardSummary, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useContentSummaryQuery = (
  options?: UseContentSummaryQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.contentDashboard.summary()],
    queryFn: () => {
      return contentDashboardService.getSummary({
        options: { axiosConfig },
      })
    },
  })
}

export interface UseAttentionItemsQueryOptions
  extends Omit<
    UseQueryOptions<ContentDashboardAttentionResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args?: AttentionQueryParams
}

export const useAttentionItemsQuery = (
  options?: UseAttentionItemsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [
      queryKeys.contentDashboard.attention(
        options?.args as Record<string, unknown> | undefined,
      ),
    ],
    queryFn: () => {
      return contentDashboardService.getAttention({
        options: { axiosConfig },
        args: options?.args,
      })
    },
  })
}

export interface UseSubjectProgressQueryOptions
  extends Omit<
    UseQueryOptions<ContentDashboardSubjectProgress[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useSubjectProgressQuery = (
  options?: UseSubjectProgressQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.contentDashboard.subjects()],
    queryFn: () => {
      return contentDashboardService.getSubjects({
        options: { axiosConfig },
      })
    },
  })
}

export interface UseContentSignalsQueryOptions
  extends Omit<
    UseQueryOptions<
      {
        highest_recall: ContentDashboardSignalItem[]
        fastest_decay: ContentDashboardSignalItem[]
      },
      Error
    >,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useContentSignalsQuery = (
  options?: UseContentSignalsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.contentDashboard.signals()],
    queryFn: () => {
      return contentDashboardService.getSignals({
        options: { axiosConfig },
      })
    },
  })
}

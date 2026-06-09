import {
  type AxiosConfigOptions,
  type TopicAction,
  type TopicComponent,
  type TopicIssue,
  type TopicOverview,
  type TopicTrends,
  topicDetailService,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseTopicOverviewQueryOptions
  extends Omit<UseQueryOptions<TopicOverview, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTopicOverviewQuery = (
  options: UseTopicOverviewQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicDetail.overview(options.args.topicId)],
    queryFn: () =>
      topicDetailService.getOverview({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseTopicIssuesQueryOptions
  extends Omit<UseQueryOptions<TopicIssue[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTopicIssuesQuery = (options: UseTopicIssuesQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicDetail.issues(options.args.topicId)],
    queryFn: () =>
      topicDetailService.getIssues({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseTopicComponentsQueryOptions
  extends Omit<
    UseQueryOptions<TopicComponent[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTopicComponentsQuery = (
  options: UseTopicComponentsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicDetail.components(options.args.topicId)],
    queryFn: () =>
      topicDetailService.getComponents({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseTopicActionsQueryOptions
  extends Omit<UseQueryOptions<TopicAction[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTopicActionsQuery = (options: UseTopicActionsQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicDetail.actions(options.args.topicId)],
    queryFn: () =>
      topicDetailService.getActions({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseTopicTrendsQueryOptions
  extends Omit<
    UseQueryOptions<TopicTrends | null, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTopicTrendsQuery = (options: UseTopicTrendsQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicDetail.trends(options.args.topicId)],
    queryFn: () =>
      topicDetailService.getTrends({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

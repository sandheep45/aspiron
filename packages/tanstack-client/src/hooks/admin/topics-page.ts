import {
  type AxiosConfigOptions,
  type InsightItem,
  type TopicItem,
  type TopicSummary,
  type TopicsQueryParams,
  topicsPageService,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseTopicSummaryQueryOptions
  extends Omit<UseQueryOptions<TopicSummary, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { chapterId: string }
}

export const useTopicSummaryQuery = (options: UseTopicSummaryQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicsPage.chapter(options.args.chapterId)],
    queryFn: () => {
      return topicsPageService.getChapterSummary({
        args: options.args,
        options: { axiosConfig },
      })
    },
  })
}

export interface UseChapterTopicsQueryOptions
  extends Omit<UseQueryOptions<TopicItem[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { chapterId: string } & TopicsQueryParams
}

export const useChapterTopicsQuery = (
  options: UseChapterTopicsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [
      queryKeys.topicsPage.topics(options.args.chapterId, {
        search: options.args.search,
        sort_by: options.args.sort_by,
        sort_order: options.args.sort_order,
        page: options.args.page,
        limit: options.args.limit,
        status_filter: options.args.status_filter,
        content_status_filter: options.args.content_status_filter,
        recall_filter: options.args.recall_filter,
        video_filter: options.args.video_filter,
      }),
    ],
    queryFn: () => {
      return topicsPageService.getTopics({
        args: options.args,
        options: { axiosConfig },
      })
    },
  })
}

export interface UseChapterInsightsQueryOptions
  extends Omit<UseQueryOptions<InsightItem[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { chapterId: string }
}

export const useChapterInsightsQuery = (
  options: UseChapterInsightsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.topicsPage.insights(options.args.chapterId)],
    queryFn: () => {
      return topicsPageService.getInsights({
        args: options.args,
        options: { axiosConfig },
      })
    },
  })
}

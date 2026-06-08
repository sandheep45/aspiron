import {
  type AxiosConfigOptions,
  type ChapterItem,
  type ChapterSummary,
  type ChaptersQueryParams,
  chaptersPageService,
  type InsightItem,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseSubjectSummaryQueryOptions
  extends Omit<UseQueryOptions<ChapterSummary, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { subjectId: string }
}

export const useSubjectSummaryQuery = (
  options: UseSubjectSummaryQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.chaptersPage.subject(options.args.subjectId)],
    queryFn: () => {
      return chaptersPageService.getSubjectSummary({
        args: options.args,
        options: { axiosConfig },
      })
    },
  })
}

export interface UseSubjectChaptersQueryOptions
  extends Omit<UseQueryOptions<ChapterItem[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { subjectId: string } & ChaptersQueryParams
}

export const useSubjectChaptersQuery = (
  options: UseSubjectChaptersQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [
      queryKeys.chaptersPage.chapters(options.args.subjectId, {
        search: options.args.search,
        sort_by: options.args.sort_by,
        sort_order: options.args.sort_order,
        page: options.args.page,
        limit: options.args.limit,
      }),
    ],
    queryFn: () => {
      return chaptersPageService.getChapters({
        args: options.args,
        options: { axiosConfig },
      })
    },
  })
}

export interface UseSubjectInsightsQueryOptions
  extends Omit<UseQueryOptions<InsightItem[], Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
  args: { subjectId: string }
}

export const useSubjectInsightsQuery = (
  options: UseSubjectInsightsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.chaptersPage.insights(options.args.subjectId)],
    queryFn: () => {
      return chaptersPageService.getInsights({
        args: options.args,
        options: { axiosConfig },
      })
    },
  })
}

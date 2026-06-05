import {
  type AxiosConfigOptions,
  type SubjectPageItem,
  type SubjectSignal,
  type SubjectSummary,
  subjectsPageService,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseSubjectsPageSubjectsQueryOptions
  extends Omit<
    UseQueryOptions<SubjectPageItem[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useSubjectsPageSubjectsQuery = (
  options?: UseSubjectsPageSubjectsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.subjectsPage.subjects()],
    queryFn: () => {
      return subjectsPageService.getSubjects({
        options: { axiosConfig },
      })
    },
  })
}

export interface UseSubjectsPageSummaryQueryOptions
  extends Omit<UseQueryOptions<SubjectSummary, Error>, 'queryFn' | 'queryKey'> {
  axiosConfig?: AxiosConfigOptions
}

export const useSubjectsPageSummaryQuery = (
  options?: UseSubjectsPageSummaryQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.subjectsPage.summary()],
    queryFn: () => {
      return subjectsPageService.getSummary({
        options: { axiosConfig },
      })
    },
  })
}

export interface UseSubjectsPageSignalsQueryOptions
  extends Omit<
    UseQueryOptions<SubjectSignal[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useSubjectsPageSignalsQuery = (
  options?: UseSubjectsPageSignalsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.subjectsPage.signals()],
    queryFn: () => {
      return subjectsPageService.getSignals({
        options: { axiosConfig },
      })
    },
  })
}

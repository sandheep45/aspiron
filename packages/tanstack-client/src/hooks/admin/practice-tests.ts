import {
  type AxiosConfigOptions,
  type CreateQuestionRequest,
  type CreateQuestionResponse,
  type CreateTestRequest,
  type CreateTestResponse,
  type PracticeOverview,
  type PracticeSignal,
  practiceTestsService,
  type QuestionsQueryParams,
  type QuestionsResponse,
  type TestAnalytics,
  type TopicTestItem,
} from '@aspiron/api-client'
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UsePracticeOverviewQueryOptions
  extends Omit<
    UseQueryOptions<PracticeOverview, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const usePracticeOverviewQuery = (
  options: UsePracticeOverviewQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.practiceTests.overview(options.args.topicId)],
    queryFn: () =>
      practiceTestsService.getOverview({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseQuestionsQueryOptions
  extends Omit<
    UseQueryOptions<QuestionsResponse, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string } & QuestionsQueryParams
}

export const useQuestionsQuery = (options: UseQuestionsQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  const { topicId, ...params } = options.args
  return useQuery({
    ...options,
    queryKey: [
      queryKeys.practiceTests.questions(
        topicId,
        params as Record<string, unknown>,
      ),
    ],
    queryFn: () =>
      practiceTestsService.getQuestions({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!topicId,
  })
}

export interface UseTopicTestsQueryOptions
  extends Omit<
    UseQueryOptions<TopicTestItem[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTopicTestsQuery = (options: UseTopicTestsQueryOptions) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.practiceTests.tests(options.args.topicId)],
    queryFn: () =>
      practiceTestsService.getTopicTests({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UsePracticeSignalsQueryOptions
  extends Omit<
    UseQueryOptions<PracticeSignal[], Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const usePracticeSignalsQuery = (
  options: UsePracticeSignalsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.practiceTests.signals(options.args.topicId)],
    queryFn: () =>
      practiceTestsService.getSignals({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseTestAnalyticsQueryOptions
  extends Omit<
    UseQueryOptions<TestAnalytics | null, Error>,
    'queryFn' | 'queryKey'
  > {
  axiosConfig?: AxiosConfigOptions
  args: { topicId: string }
}

export const useTestAnalyticsQuery = (
  options: UseTestAnalyticsQueryOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useQuery({
    ...options,
    queryKey: [queryKeys.practiceTests.analytics(options.args.topicId)],
    queryFn: () =>
      practiceTestsService.getAnalytics({
        options: { axiosConfig },
        args: options.args,
      }),
    enabled: !!options.args.topicId,
  })
}

export interface UseCreateQuestionMutationOptions
  extends Omit<
    UseMutationOptions<
      CreateQuestionResponse,
      Error,
      CreateQuestionRequest & { topicId: string }
    >,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useCreateQuestionMutation = (
  options?: UseCreateQuestionMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useMutation({
    ...options,
    mutationFn: (args) =>
      practiceTestsService.createQuestion({
        options: { axiosConfig },
        args,
      }),
  })
}

export interface UseCreateTestMutationOptions
  extends Omit<
    UseMutationOptions<
      CreateTestResponse,
      Error,
      CreateTestRequest & { topicId: string }
    >,
    'mutationFn'
  > {
  axiosConfig?: AxiosConfigOptions
}

export const useCreateTestMutation = (
  options?: UseCreateTestMutationOptions,
) => {
  const axiosConfig = useMergedAxiosConfig(options)
  return useMutation({
    ...options,
    mutationFn: (args) =>
      practiceTestsService.createTest({
        options: { axiosConfig },
        args,
      }),
  })
}

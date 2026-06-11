import { getClient } from '@/client/axios-instance'
import type {
  CreateQuestionRequest,
  CreateQuestionResponse,
  CreateTestRequest,
  CreateTestResponse,
  PracticeOverview,
  PracticeSignal,
  QuestionsQueryParams,
  QuestionsResponse,
  TestAnalytics,
  TopicTestItem,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const practiceTestsService = {
  createTest: async ({
    args,
    options,
  }: ServiceMethodArguments<
    CreateTestRequest & { topicId: string }
  >): Promise<CreateTestResponse> => {
    const client = getClient(options)
    const { topicId, ...payload } = args ?? { topicId: '' }
    const response = await client.post<CreateTestResponse>(
      `/topics/${topicId}/practice/tests`,
      payload,
    )
    return response.data
  },

  createQuestion: async ({
    args,
    options,
  }: ServiceMethodArguments<
    CreateQuestionRequest & { topicId: string }
  >): Promise<CreateQuestionResponse> => {
    const client = getClient(options)
    const { topicId, ...payload } = args ?? { topicId: '' }
    const response = await client.post<CreateQuestionResponse>(
      `/topics/${topicId}/practice/questions`,
      payload,
    )
    return response.data
  },

  getOverview: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<PracticeOverview> => {
    const client = getClient(options)
    const response = await client.get<PracticeOverview>(
      `/topics/${args?.topicId}/practice/overview`,
    )
    return response.data
  },

  getQuestions: async ({
    args,
    options,
  }: ServiceMethodArguments<
    QuestionsQueryParams & { topicId: string }
  >): Promise<QuestionsResponse> => {
    const client = getClient(options)
    const { topicId, ...params } = args ?? { topicId: '' }
    const response = await client.get<QuestionsResponse>(
      `/topics/${topicId}/practice/questions`,
      { params },
    )
    return response.data
  },

  getTopicTests: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<TopicTestItem[]> => {
    const client = getClient(options)
    const response = await client.get<TopicTestItem[]>(
      `/topics/${args?.topicId}/practice/tests`,
    )
    return response.data
  },

  getSignals: async ({
    args,
    options,
  }: ServiceMethodArguments<{ topicId: string }>): Promise<
    PracticeSignal[]
  > => {
    const client = getClient(options)
    const response = await client.get<PracticeSignal[]>(
      `/topics/${args?.topicId}/practice/signals`,
    )
    return response.data
  },

  getAnalytics: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    topicId: string
  }>): Promise<TestAnalytics | null> => {
    const client = getClient(options)
    const response = await client.get<TestAnalytics | null>(
      `/topics/${args?.topicId}/practice/analytics`,
    )
    return response.data
  },
}

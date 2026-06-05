import { getClient } from '@/client/axios-instance'
import type {
  SubjectPageItem,
  SubjectSignal,
  SubjectSummary,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const subjectsPageService = {
  getSubjects: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<SubjectPageItem[]> => {
    const client = getClient(options)
    const response = await client.get<SubjectPageItem[]>(
      '/content/subjects-page',
    )
    return response.data
  },

  getSummary: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<SubjectSummary> => {
    const client = getClient(options)
    const response = await client.get<SubjectSummary>(
      '/content/subjects-page/summary',
    )
    return response.data
  },

  getSignals: async ({
    options,
  }: ServiceMethodArguments<undefined>): Promise<SubjectSignal[]> => {
    const client = getClient(options)
    const response = await client.get<SubjectSignal[]>(
      '/content/subjects-page/signals',
    )
    return response.data
  },
}

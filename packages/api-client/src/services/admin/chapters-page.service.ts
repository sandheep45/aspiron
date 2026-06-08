import { getClient } from '@/client/axios-instance'
import type {
  ChapterItem,
  ChapterSummary,
  ChaptersQueryParams,
  InsightItem,
} from '@/generated-types'
import type { ServiceMethodArguments } from '@/types'

export const chaptersPageService = {
  getSubjectSummary: async ({
    args,
    options,
  }: ServiceMethodArguments<{
    subjectId: string
  }>): Promise<ChapterSummary> => {
    const client = getClient(options)
    const response = await client.get<ChapterSummary>(
      `/subjects/${args?.subjectId}/chapters-page/summary`,
    )
    return response.data
  },

  getChapters: async ({
    args,
    options,
  }: ServiceMethodArguments<
    { subjectId: string } & ChaptersQueryParams
  >): Promise<ChapterItem[]> => {
    const client = getClient(options)
    const response = await client.get<ChapterItem[]>(
      `/subjects/${args?.subjectId}/chapters-page/chapters`,
      {
        params: {
          ...(args?.search && { search: args.search }),
          ...(args?.sort_by && { sort_by: args.sort_by }),
          ...(args?.sort_order && { sort_order: args.sort_order }),
          ...(args?.page && { page: args.page }),
          ...(args?.limit && { limit: args.limit }),
        },
      },
    )
    return response.data
  },

  getInsights: async ({
    args,
    options,
  }: ServiceMethodArguments<{ subjectId: string }>): Promise<InsightItem[]> => {
    const client = getClient(options)
    const response = await client.get<InsightItem[]>(
      `/subjects/${args?.subjectId}/chapters-page/insights`,
    )
    return response.data
  },
}

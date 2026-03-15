import {
  type AxiosConfigOptions,
  contentTopicService,
  type GetTopicByIdPayload,
  type TopicDto,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useAxiosConfig } from '@/providers/QueryProvider'
import { queryKeys } from '@/types/query-keys'

export interface UseGetTopicByIdOptions
  extends Omit<UseQueryOptions<TopicDto, Error>, 'queryFn' | 'queryKey'> {
  args: GetTopicByIdPayload
  axiosConfig?: AxiosConfigOptions
}

export function useGetTopicByIdQuery(options: UseGetTopicByIdOptions) {
  const providerAxiosConfig = useAxiosConfig()

  return useQuery({
    ...options,
    queryKey: [queryKeys.contents.topics.getTopicById(options.args.topicId)],
    queryFn: () => {
      const config = options?.axiosConfig || providerAxiosConfig || undefined
      return contentTopicService.getTopicById({
        args: options.args,
        options: {
          axiosConfig: config,
        },
      })
    },
  })
}

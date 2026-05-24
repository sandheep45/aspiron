import {
  type AxiosConfigOptions,
  contentTopicService,
  type GetTopicByIdPayload,
  type TopicDto,
} from '@aspiron/api-client'
import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import { useMergedAxiosConfig } from '@/hooks/use-merged-axios-config'
import { queryKeys } from '@/types/query-keys'

export interface UseGetTopicByIdOptions
  extends Omit<UseQueryOptions<TopicDto, Error>, 'queryFn' | 'queryKey'> {
  args: GetTopicByIdPayload
  axiosConfig?: AxiosConfigOptions
}

export function useGetTopicByIdQuery(options: UseGetTopicByIdOptions) {
  const axiosConfig = useMergedAxiosConfig(options)

  return useQuery({
    ...options,
    queryKey: [queryKeys.contents.topics.getTopicById(options.args.topicId)],
    queryFn: () => {
      return contentTopicService.getTopicById({
        args: options.args,
        options: {
          axiosConfig,
        },
      })
    },
  })
}

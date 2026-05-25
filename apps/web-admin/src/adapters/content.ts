import type { GetTopicByIdPayload, TopicDto } from '@aspiron/api-client'
import z from 'zod'

export const topicDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  chapter_id: z.string(),
  order_number: z.number(),
}) satisfies z.ZodType<TopicDto>

export const getTopicByIdPayloadSchema = z.object({
  topicId: z.string(),
}) satisfies z.ZodType<GetTopicByIdPayload>

import { z } from 'zod'

export const createClassSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
  scheduled_at: z.string().min(1, 'Date and time is required'),
  duration_min: z.coerce
    .number()
    .min(5, 'Minimum 5 minutes')
    .max(240, 'Maximum 240 minutes'),
  join_url: z
    .string()
    .url('Must be a valid URL')
    .min(1, 'Join URL is required'),
})

export type CreateClassSchema = typeof createClassSchema

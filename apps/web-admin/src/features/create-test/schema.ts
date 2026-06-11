import { z } from 'zod'

export const createTestSchema = z.object({
  title: z.string().min(1, 'Test name is required'),
  description: z.string().optional(),
  instructions: z.string().optional(),
  duration_minutes: z.number().min(1).optional(),
  passing_score: z.number().min(0).max(100).optional(),
  max_attempts: z.number().min(1).optional(),
  visibility: z.string().optional(),
  status: z.string().optional(),
})

export type CreateTestSchema = typeof createTestSchema

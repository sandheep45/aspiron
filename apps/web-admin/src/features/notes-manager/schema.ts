import { z } from 'zod'

export const referenceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  source: z.string().optional(),
  referenceType: z.string().min(1, 'Type is required'),
  url: z.string().url('Must be a valid URL').min(1, 'URL is required'),
})

export type ReferenceSchema = typeof referenceSchema

import type {
  Insight,
  InsightSeverity,
  InsightSummary,
  InsightsQueryParams,
  InsightsResponse,
  InsightType,
  TimeWindow,
} from '@aspiron/api-client'
import z from 'zod'

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
)

export const insightTypeSchema = z.enum([
  'quiz_review_pending',
  'low_attendance',
  'topic_difficulty',
  'low_engagement',
  'system_alert',
]) satisfies z.ZodType<InsightType>

export const insightSeveritySchema = z.enum([
  'danger',
  'success',
  'neutral',
  'warning',
  'info',
]) satisfies z.ZodType<InsightSeverity>

export const timeWindowSchema = z.object({
  start: z.date(),
  end: z.date(),
}) satisfies z.ZodType<TimeWindow>

export const insightSummarySchema = z.object({
  total: z.number(),
  filtered_item: z.nullable(z.string()),
  filtered_item_count: z.number(),
  danger: z.number(),
  success: z.number(),
  neutral: z.number(),
  warning: z.number(),
  info: z.number(),
}) satisfies z.ZodType<InsightSummary>

export const insightSchema = z.object({
  id: z.string(),
  insight_type: insightTypeSchema,
  severity: insightSeveritySchema,
  title: z.string(),
  description: z.string(),
  metadata: jsonValueSchema,
  detected_at: z.date(),
}) satisfies z.ZodType<Insight>

export const insightsResponseSchema = z.object({
  time_window: timeWindowSchema,
  insights: z.array(insightSchema),
  summary: insightSummarySchema,
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.bigint(),
    filtered_total: z.bigint(),
    total_pages: z.number(),
  }),
}) satisfies z.ZodType<InsightsResponse>

export const insightsQueryParamsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  severity: insightSeveritySchema.optional(),
  insight_type: insightTypeSchema.optional(),
  start: z.coerce.bigint().optional(),
  end: z.coerce.bigint().optional(),
  sort_by: z.enum(['detected_at', 'severity']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
}) satisfies z.ZodType<InsightsQueryParams>

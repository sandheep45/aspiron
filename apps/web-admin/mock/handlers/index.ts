import { assessmentHandlers } from './assessment.handlers'
import { authHandlers } from './auth.handlers'
import { contentHandlers } from './content.handlers'
import { healthHandlers } from './health.handlers'
import { insightsHandlers } from './insights.handlers'
import { learningHandlers } from './learning.handlers'

export const handlers = [
  ...assessmentHandlers,
  ...authHandlers,
  ...contentHandlers,
  ...healthHandlers,
  ...insightsHandlers,
  ...learningHandlers,
]

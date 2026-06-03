import { assessmentHandlers } from './assessment.handlers'
import { authHandlers } from './auth.handlers'
import { communityHandlers } from './community.handlers'
import { contentHandlers } from './content.handlers'
import { healthHandlers } from './health.handlers'
import { insightsHandlers } from './insights.handlers'
import { learningHandlers } from './learning.handlers'
import { liveSessionHandlers } from './live-session.handlers'
import { notesHandlers } from './notes.handlers'
import { notificationHandlers } from './notification.handlers'
import { painPointsHandlers } from './pain-points.handlers'
import { topicPerformanceHandlers } from './topic-performance.handlers'
import { upcomingClassesHandlers } from './upcoming-classes.handlers'

export const handlers = [
  ...assessmentHandlers,
  ...authHandlers,
  ...communityHandlers,
  ...contentHandlers,
  ...healthHandlers,
  ...insightsHandlers,
  ...learningHandlers,
  ...liveSessionHandlers,
  ...notesHandlers,
  ...notificationHandlers,
  ...painPointsHandlers,
  ...topicPerformanceHandlers,
  ...upcomingClassesHandlers,
]

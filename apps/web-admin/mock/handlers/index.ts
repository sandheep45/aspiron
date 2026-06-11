import { assessmentHandlers } from './assessment.handlers'
import { authHandlers } from './auth.handlers'
import { chaptersPageHandlers } from './chapters-page.handlers'
import { communityHandlers } from './community.handlers'
import { contentHandlers } from './content.handlers'
import { contentDashboardHandlers } from './content-dashboard.handlers'
import { healthHandlers } from './health.handlers'
import { insightsHandlers } from './insights.handlers'
import { learningHandlers } from './learning.handlers'
import { liveSessionHandlers } from './live-session.handlers'
import { notesHandlers } from './notes.handlers'
import { notesManagerHandlers } from './notes-manager.handlers'
import { notificationHandlers } from './notification.handlers'
import { painPointsHandlers } from './pain-points.handlers'
import { practiceTestsHandlers } from './practice-tests.handlers'
import { subjectsPageHandlers } from './subjects-page.handlers'
import { topicDetailHandlers } from './topic-detail.handlers'
import { topicPerformanceHandlers } from './topic-performance.handlers'
import { topicsPageHandlers } from './topics-page.handlers'
import { upcomingClassesHandlers } from './upcoming-classes.handlers'

export const handlers = [
  ...assessmentHandlers,
  ...authHandlers,
  ...chaptersPageHandlers,
  ...communityHandlers,
  ...contentDashboardHandlers,
  ...contentHandlers,
  ...healthHandlers,
  ...insightsHandlers,
  ...learningHandlers,
  ...liveSessionHandlers,
  ...notesHandlers,
  ...notesManagerHandlers,
  ...notificationHandlers,
  ...painPointsHandlers,
  ...practiceTestsHandlers,
  ...subjectsPageHandlers,
  ...topicPerformanceHandlers,
  ...topicDetailHandlers,
  ...topicsPageHandlers,
  ...upcomingClassesHandlers,
]

import type {
  LowAttendanceMetadata,
  LowEngagementMetadata,
  QuizReviewPendingMetadata,
  TopicDifficultyMetadata,
} from '@/generated-types'

export type InsightMetadataMap = {
  topic_difficulty: TopicDifficultyMetadata
  quiz_review_pending: QuizReviewPendingMetadata
  low_attendance: LowAttendanceMetadata
  low_engagement: LowEngagementMetadata
  // system_alert: string;
}

export type GetTopicByIdPayload = { topicId: string }

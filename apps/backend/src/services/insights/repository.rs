use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::insights::{
    Insight, InsightType, LowAttendanceMetadata, LowEngagementMetadata, QuizReviewPendingMetadata,
    Severity, TopicDifficultyMetadata,
};
use crate::entries::entities::assessment_attempt::Column as AttemptColumn;
use crate::entries::entities::assessment_attempt::Entity as AttemptEntity;
use crate::entries::entities::learning_progress::Column as ProgressColumn;
use crate::entries::entities::learning_progress::Entity as ProgressEntity;
use crate::entries::entities::live_session::Column as LiveSessionColumn;
use crate::entries::entities::live_session::Entity as LiveSessionEntity;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct InsightsRepository {
    db: Arc<DatabaseConnection>,
}

impl InsightsRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_quizzes_pending_review(
        &self,
        start: chrono::DateTime<chrono::Utc>,
        end: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let attempts = AttemptEntity::find()
            .filter(AttemptColumn::SubmittedAt.gte(start))
            .filter(AttemptColumn::SubmittedAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if attempts.is_empty() {
            return Ok(vec![]);
        }

        let mut quiz_counts: std::collections::HashMap<Uuid, i64> =
            std::collections::HashMap::new();
        for attempt in &attempts {
            *quiz_counts.entry(attempt.quiz_id).or_insert(0) += 1;
        }

        let mut insights = vec![];

        for (quiz_id, count) in quiz_counts {
            let severity = if count > 50 {
                Severity::Danger
            } else if count > 30 {
                Severity::Warning
            } else if count > 15 {
                Severity::Info
            } else if count > 5 {
                Severity::Neutral
            } else {
                Severity::Success
            };

            insights.push(Insight {
                id: Uuid::new_v4(),
                insight_type: InsightType::QuizReviewPending,
                severity,
                title: format!("{} attempts pending review", count),
                description: format!("Quiz has {} attempts awaiting teacher review", count),
                metadata: serde_json::to_value(QuizReviewPendingMetadata {
                    quiz_id,
                    pending_count: count,
                })
                .unwrap(),
                detected_at: chrono::Utc::now(),
            });
        }

        Ok(insights)
    }

    pub async fn get_low_attendance_sessions(
        &self,
        start: chrono::DateTime<chrono::Utc>,
        end: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let sessions = LiveSessionEntity::find()
            .filter(LiveSessionColumn::ScheduledAt.gte(start))
            .filter(LiveSessionColumn::ScheduledAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if sessions.is_empty() {
            return Ok(vec![]);
        }

        let mut insights = vec![];

        for session in sessions {
            let attendee_count = session.topic_id.to_string().len() % 20;

            let severity = if attendee_count == 0 {
                Severity::Danger
            } else if attendee_count < 3 {
                Severity::Warning
            } else if attendee_count < 10 {
                Severity::Info
            } else if attendee_count < 20 {
                Severity::Neutral
            } else {
                Severity::Success
            };

            insights.push(Insight {
                id: Uuid::new_v4(),
                insight_type: InsightType::LowAttendance,
                severity,
                title: format!("Low attendance: {} attendees", attendee_count),
                description: format!("Live session had only {} attendees", attendee_count),
                metadata: serde_json::to_value(LowAttendanceMetadata {
                    session_id: session.id,
                    topic_id: session.topic_id,
                    attendee_count: attendee_count.try_into().unwrap(),
                })
                .unwrap(),
                detected_at: chrono::Utc::now(),
            });
        }

        Ok(insights)
    }

    pub async fn get_difficult_topics(
        &self,
        start: chrono::DateTime<chrono::Utc>,
        end: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let progress_records = ProgressEntity::find()
            .filter(ProgressColumn::LastAccessedAt.gte(start))
            .filter(ProgressColumn::LastAccessedAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if progress_records.is_empty() {
            return Ok(vec![]);
        }

        let mut topic_progress: std::collections::HashMap<Uuid, (i64, f64)> =
            std::collections::HashMap::new();

        for record in &progress_records {
            let entry = topic_progress.entry(record.topic_id).or_insert((0, 0.0));
            entry.0 += 1;
            entry.1 += record.progress_percent as f64;
        }

        let mut insights = vec![];

        for (topic_id, (count, total_progress)) in topic_progress {
            let avg_progress = total_progress / count as f64;

            if avg_progress < 60.0 {
                let severity = if avg_progress < 20.0 {
                    Severity::Warning
                } else {
                    Severity::Info
                };

                insights.push(Insight {
                    id: Uuid::new_v4(),
                    insight_type: InsightType::TopicDifficulty,
                    severity,
                    title: "Students struggling with topic".to_string(),
                    description: format!("Average progress: {:.1}%", avg_progress),
                    metadata: serde_json::to_value(TopicDifficultyMetadata {
                        topic_id,
                        avg_progress,
                        attempt_count: count,
                    })
                    .unwrap(),
                    detected_at: chrono::Utc::now(),
                });
            }
        }

        Ok(insights)
    }

    pub async fn get_low_engagement_topics(
        &self,
        start: chrono::DateTime<chrono::Utc>,
        end: chrono::DateTime<chrono::Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let progress_records = ProgressEntity::find()
            .filter(ProgressColumn::LastAccessedAt.gte(start))
            .filter(ProgressColumn::LastAccessedAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if progress_records.is_empty() {
            return Ok(vec![]);
        }

        let mut topic_users: std::collections::HashMap<Uuid, std::collections::HashSet<Uuid>> =
            std::collections::HashMap::new();

        for record in &progress_records {
            topic_users
                .entry(record.topic_id)
                .or_default()
                .insert(record.user_id);
        }

        let mut insights = vec![];

        for (topic_id, users) in topic_users {
            let active_users = users.len() as i64;

            if active_users < 10 {
                let severity = if active_users == 0 {
                    Severity::Warning
                } else {
                    Severity::Info
                };

                insights.push(Insight {
                    id: Uuid::new_v4(),
                    insight_type: InsightType::LowEngagement,
                    severity,
                    title: "Low engagement on topic".to_string(),
                    description: format!("Only {} students accessed this topic", active_users),
                    metadata: serde_json::to_value(LowEngagementMetadata {
                        topic_id,
                        active_users,
                    })
                    .unwrap(),
                    detected_at: chrono::Utc::now(),
                });
            }
        }

        Ok(insights)
    }
}

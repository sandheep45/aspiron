use async_trait::async_trait;
use chrono::{DateTime, Utc};
use uuid::Uuid;

use crate::domain::insights::entities::{Insight, PainPointTopicDetail, TopicPerformance};
use crate::setup::error::AppError;

#[async_trait]
pub trait InsightsRepository: Send + Sync {
    async fn get_quizzes_pending_review(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError>;
    async fn get_low_attendance_sessions(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError>;
    async fn get_difficult_topics(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError>;
    async fn get_low_engagement_topics(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError>;
    async fn get_topic_performance(
        &self,
        subject_id: Option<Uuid>,
        chapter_id: Option<Uuid>,
        topic_id: Option<Uuid>,
    ) -> Result<Vec<TopicPerformance>, AppError>;
    async fn get_topic_detail(
        &self,
        topic_id: Uuid,
    ) -> Result<Option<PainPointTopicDetail>, AppError>;
}

#[async_trait]
pub trait AuthorizationPort: Send + Sync {
    async fn has_permission(
        &self,
        user_id: Uuid,
        resource_type: String,
        action: String,
    ) -> Result<bool, AppError>;
}

use chrono::{DateTime, Utc};
use uuid::Uuid;

use super::value_objects::{ProgressPercentage, RecallSessionStatus};

#[derive(Debug, Clone)]
pub struct Note {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub owner_id: Option<Uuid>,
    pub owner_type: String,
    pub content: Option<String>,
    pub title: String,
    pub is_official: bool,
    pub is_public: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct LearningProgress {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub progress_percent: ProgressPercentage,
    pub last_accessed_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct RecallSession {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub status: RecallSessionStatus,
    pub started_at: DateTime<Utc>,
    pub completed_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct RecallAnswer {
    pub id: Uuid,
    pub session_id: Uuid,
    pub question_type: String,
    pub question: String,
    pub answer: String,
    pub is_correct: bool,
    pub score: Option<i32>,
}

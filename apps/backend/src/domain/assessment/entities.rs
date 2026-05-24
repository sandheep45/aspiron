use chrono::{DateTime, Utc};
use serde_json::Value;
use uuid::Uuid;

use super::value_objects::QuizScore;

#[derive(Debug, Clone)]
pub struct Quiz {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
    pub description: String,
    pub time_limit_minutes: i32,
    pub passing_score: i32,
}

#[derive(Debug, Clone)]
pub struct Question {
    pub id: Uuid,
    pub quiz_id: Uuid,
    pub question: String,
    pub correct_answer: String,
    pub options: Value,
}

#[derive(Debug, Clone)]
pub struct Attempt {
    pub id: Uuid,
    pub quiz_id: Uuid,
    pub user_id: Uuid,
    pub started_at: DateTime<Utc>,
    pub submitted_at: Option<DateTime<Utc>>,
    pub score: QuizScore,
}

#[derive(Debug, Clone)]
pub struct ProctoringSignal {
    pub id: Uuid,
    pub attempt_id: Uuid,
    pub signal_type: String,
    pub signal_value: String,
    pub created_at: DateTime<Utc>,
}

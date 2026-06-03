use chrono::{DateTime, Utc};
use serde::Serialize;
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Insight {
    pub id: Uuid,
    pub insight_type: InsightType,
    pub severity: Severity,
    pub title: String,
    pub description: String,
    pub metadata: Value,
    pub detected_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct TopicPerformance {
    pub topic_id: Uuid,
    pub subject_id: Uuid,
    pub topic_name: String,
    pub chapter_name: String,
    pub subject_name: String,
    pub recall_strength_mcq: Option<f64>,
    pub recall_strength_reflection: Option<f64>,
    pub practice_accuracy: f64,
    pub students_affected: i64,
    pub total_students: i64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Severity {
    Danger,
    Success,
    Neutral,
    Warning,
    Info,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InsightType {
    QuizReviewPending,
    LowAttendance,
    TopicDifficulty,
    LowEngagement,
    SystemAlert,
}

impl InsightType {
    pub fn as_str(&self) -> &'static str {
        match self {
            InsightType::QuizReviewPending => "quiz_review_pending",
            InsightType::LowAttendance => "low_attendance",
            InsightType::TopicDifficulty => "topic_difficulty",
            InsightType::LowEngagement => "low_engagement",
            InsightType::SystemAlert => "system_alert",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct QuizReviewPendingMetadata {
    pub quiz_id: Uuid,
    pub pending_count: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct LowAttendanceMetadata {
    pub session_id: Uuid,
    pub topic_id: Uuid,
    pub attendee_count: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct TopicDifficultyMetadata {
    pub topic_id: Uuid,
    pub avg_progress: f64,
    pub attempt_count: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct LowEngagementMetadata {
    pub topic_id: Uuid,
    pub active_users: i64,
}

#[derive(Debug, Clone)]
pub struct PainPointTopicDetail {
    pub topic_id: Uuid,
    pub topic_name: String,
    pub chapter_name: String,
    pub subject_name: String,
    pub practice_accuracy: f64,
    pub recall_strength_mcq: Option<f64>,
    pub recall_strength_reflection: Option<f64>,
    pub students_affected: i64,
    pub total_students: i64,
    pub trend: String,
    pub common_mistakes: Vec<String>,
    pub weak_questions: Vec<String>,
    pub recommendations: Vec<String>,
}

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export, rename = "InsightSeverity")]
pub enum Severity {
    Danger,
    Success,
    Neutral,
    Warning,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export, rename = "InsightType")]
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

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct QuizReviewPendingMetadata {
    pub quiz_id: Uuid,
    pub pending_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LowAttendanceMetadata {
    pub session_id: Uuid,
    pub topic_id: Uuid,
    pub attendee_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct TopicDifficultyMetadata {
    pub topic_id: Uuid,
    pub avg_progress: f64,
    pub attempt_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LowEngagementMetadata {
    pub topic_id: Uuid,
    pub active_users: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "Insight")]
pub struct Insight {
    pub id: Uuid,
    pub insight_type: InsightType,
    pub severity: Severity,
    pub title: String,
    pub description: String,
    pub metadata: serde_json::Value,
    #[ts(type = "Date")]
    pub detected_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "InsightSummary")]
pub struct InsightSummary {
    pub danger: usize,
    pub success: usize,
    pub neutral: usize,
    pub warning: usize,
    pub info: usize,
}

impl InsightSummary {
    pub fn from_insights(insights: &[Insight]) -> Self {
        let mut danger = 0;
        let mut success = 0;
        let mut neutral = 0;
        let mut warning = 0;
        let mut info = 0;

        for insight in insights {
            match insight.severity {
                Severity::Danger => danger += 1,
                Severity::Success => success += 1,
                Severity::Neutral => neutral += 1,
                Severity::Warning => warning += 1,
                Severity::Info => info += 1,
            }
        }

        Self {
            danger,
            success,
            neutral,
            warning,
            info,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "InsightsResponse")]
pub struct InsightsResponse {
    pub time_window: TimeWindow,
    pub insights: Vec<Insight>,
    pub summary: InsightSummary,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "TimeWindow")]
pub struct TimeWindow {
    #[ts(type = "Date")]
    pub start: DateTime<Utc>,
    #[ts(type = "Date")]
    pub end: DateTime<Utc>,
}

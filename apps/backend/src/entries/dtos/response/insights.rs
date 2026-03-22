use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::entries::dtos::response::common::PaginationResponse;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, TS, ToSchema,
)]
#[serde(rename_all = "lowercase")]
#[ts(export, rename = "InsightSeverity")]
pub enum Severity {
    Danger,
    Success,
    Neutral,
    Warning,
    Info,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS, ToSchema)]
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

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export)]
pub struct QuizReviewPendingMetadata {
    #[schema(value_type = String)]
    pub quiz_id: Uuid,
    pub pending_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export)]
pub struct LowAttendanceMetadata {
    #[schema(value_type = String)]
    pub session_id: Uuid,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub attendee_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export)]
pub struct TopicDifficultyMetadata {
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub avg_progress: f64,
    pub attempt_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export)]
pub struct LowEngagementMetadata {
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub active_users: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "Insight")]
pub struct Insight {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub insight_type: InsightType,
    pub severity: Severity,
    pub title: String,
    pub description: String,
    pub metadata: serde_json::Value,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub detected_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "InsightSummary")]
pub struct InsightSummary {
    pub total: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub filtered_item: Option<String>,
    pub filtered_item_count: usize,
    pub danger: usize,
    pub success: usize,
    pub neutral: usize,
    pub warning: usize,
    pub info: usize,
}

impl InsightSummary {
    pub fn from_insights(
        insights: &[Insight],
        total: usize,
        filtered_count: usize,
        filtered_item: Option<String>,
    ) -> Self {
        let counts = SeverityCounts::from_insights(insights);
        Self {
            total,
            filtered_item,
            filtered_item_count: filtered_count,
            danger: counts.danger,
            success: counts.success,
            neutral: counts.neutral,
            warning: counts.warning,
            info: counts.info,
        }
    }

    pub fn with_severity_counts(
        total: usize,
        filtered_count: usize,
        filtered_item: Option<String>,
        counts: SeverityCounts,
    ) -> Self {
        Self {
            total,
            filtered_item,
            filtered_item_count: filtered_count,
            danger: counts.danger,
            success: counts.success,
            neutral: counts.neutral,
            warning: counts.warning,
            info: counts.info,
        }
    }
}

#[derive(Debug, Clone, Default)]
pub struct SeverityCounts {
    pub danger: usize,
    pub success: usize,
    pub neutral: usize,
    pub warning: usize,
    pub info: usize,
}

impl SeverityCounts {
    pub fn from_insights(insights: &[Insight]) -> Self {
        let mut counts = Self::default();
        for insight in insights {
            match insight.severity {
                Severity::Danger => counts.danger += 1,
                Severity::Success => counts.success += 1,
                Severity::Neutral => counts.neutral += 1,
                Severity::Warning => counts.warning += 1,
                Severity::Info => counts.info += 1,
            }
        }
        counts
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "InsightsResponse")]
pub struct InsightsResponse {
    pub time_window: TimeWindow,
    pub insights: Vec<Insight>,
    pub summary: InsightSummary,
    pub pagination: PaginationResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TimeWindow")]
pub struct TimeWindow {
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub start: DateTime<Utc>,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub end: DateTime<Utc>,
}

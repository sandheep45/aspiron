use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::domain::insights::entities as domain;
use crate::http::responses::common::PaginationResponse;

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

impl From<domain::Severity> for Severity {
    fn from(s: domain::Severity) -> Self {
        match s {
            domain::Severity::Danger => Severity::Danger,
            domain::Severity::Success => Severity::Success,
            domain::Severity::Neutral => Severity::Neutral,
            domain::Severity::Warning => Severity::Warning,
            domain::Severity::Info => Severity::Info,
        }
    }
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

impl From<domain::InsightType> for InsightType {
    fn from(t: domain::InsightType) -> Self {
        match t {
            domain::InsightType::QuizReviewPending => InsightType::QuizReviewPending,
            domain::InsightType::LowAttendance => InsightType::LowAttendance,
            domain::InsightType::TopicDifficulty => InsightType::TopicDifficulty,
            domain::InsightType::LowEngagement => InsightType::LowEngagement,
            domain::InsightType::SystemAlert => InsightType::SystemAlert,
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

#[derive(Debug, Clone, Default)]
pub struct SeverityCounts {
    pub danger: usize,
    pub success: usize,
    pub neutral: usize,
    pub warning: usize,
    pub info: usize,
}

impl SeverityCounts {
    pub fn from_insights(insights: &[domain::Insight]) -> Self {
        let mut counts = Self::default();
        for insight in insights {
            match insight.severity {
                domain::Severity::Danger => counts.danger += 1,
                domain::Severity::Success => counts.success += 1,
                domain::Severity::Neutral => counts.neutral += 1,
                domain::Severity::Warning => counts.warning += 1,
                domain::Severity::Info => counts.info += 1,
            }
        }
        counts
    }
}

impl InsightSummary {
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

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicPerformanceResponse")]
pub struct TopicPerformanceResponse {
    pub topics: Vec<TopicPerformance>,
    pub pagination: PaginationResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export)]
pub struct TopicPerformance {
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    #[schema(value_type = String)]
    pub subject_id: Uuid,
    pub topic_name: String,
    pub chapter_name: String,
    pub subject_name: String,
    #[ts(optional)]
    pub recall_strength_mcq: Option<f64>,
    #[ts(optional)]
    pub recall_strength_reflection: Option<f64>,
    pub practice_accuracy: f64,
    pub students_affected: i64,
    pub total_students: i64,
}

// ─── Pain Point DTOs ───────────────────────────────────────────────

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, TS, ToSchema,
)]
#[serde(rename_all = "lowercase")]
#[ts(export, rename = "IssueSeverity")]
pub enum IssueSeverity {
    Critical,
    High,
    Medium,
    Low,
}

impl std::fmt::Display for IssueSeverity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Critical => write!(f, "critical"),
            Self::High => write!(f, "high"),
            Self::Medium => write!(f, "medium"),
            Self::Low => write!(f, "low"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CriticalIssue")]
pub struct CriticalIssue {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub topic: String,
    pub description: String,
    pub severity: IssueSeverity,
    pub students_affected: i64,
    pub action_label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CriticalIssuesResponse")]
pub struct CriticalIssuesResponse {
    pub total_urgent: i64,
    pub issues: Vec<CriticalIssue>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS, ToSchema)]
#[serde(rename_all = "lowercase")]
#[ts(export, rename = "RecallStrength")]
pub enum RecallStrength {
    Weak,
    Medium,
    Strong,
}

impl std::fmt::Display for RecallStrength {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Weak => write!(f, "weak"),
            Self::Medium => write!(f, "medium"),
            Self::Strong => write!(f, "strong"),
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS, ToSchema)]
#[serde(rename_all = "lowercase")]
#[ts(export, rename = "StatusTrend")]
pub enum StatusTrend {
    Degrading,
    Stable,
    Improving,
}

impl std::fmt::Display for StatusTrend {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Degrading => write!(f, "degrading"),
            Self::Stable => write!(f, "stable"),
            Self::Improving => write!(f, "improving"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PainPointItem")]
pub struct PainPointItem {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub topic: String,
    pub recall_strength: RecallStrength,
    pub accuracy: f64,
    pub common_mistake: String,
    pub last_activity: String,
    pub status: StatusTrend,
    pub students: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PainPointsResponse")]
pub struct PainPointsResponse {
    pub total: i64,
    pub items: Vec<PainPointItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PatternInsight")]
pub struct PatternInsight {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub title: String,
    pub metric: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PatternInsightsResponse")]
pub struct PatternInsightsResponse {
    pub insights: Vec<PatternInsight>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicDetailResponse")]
pub struct TopicDetailResponse {
    pub topic: String,
    pub accuracy: f64,
    pub students_affected: i64,
    pub trend: String,
    pub common_mistakes: Vec<String>,
    pub weak_questions: Vec<String>,
    pub recommendations: Vec<String>,
}

fn map_insight(i: domain::Insight) -> Insight {
    Insight {
        id: i.id,
        insight_type: i.insight_type.into(),
        severity: i.severity.into(),
        title: i.title,
        description: i.description,
        metadata: i.metadata,
        detected_at: i.detected_at,
    }
}

pub fn map_insights(insights: Vec<domain::Insight>) -> Vec<Insight> {
    insights.into_iter().map(map_insight).collect()
}

pub fn map_topic_performance(tp: domain::TopicPerformance) -> TopicPerformance {
    TopicPerformance {
        topic_id: tp.topic_id,
        subject_id: tp.subject_id,
        topic_name: tp.topic_name,
        chapter_name: tp.chapter_name,
        subject_name: tp.subject_name,
        recall_strength_mcq: tp.recall_strength_mcq,
        recall_strength_reflection: tp.recall_strength_reflection,
        practice_accuracy: tp.practice_accuracy,
        students_affected: tp.students_affected,
        total_students: tp.total_students,
    }
}

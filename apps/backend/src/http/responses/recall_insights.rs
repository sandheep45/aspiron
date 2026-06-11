use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallOverview")]
pub struct RecallOverviewResponse {
    pub avg_recall_score: f64,
    pub completion_rate: f64,
    pub memory_decay: String,
    pub last_recall_run: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "DifficultyBreakdownItem")]
pub struct DifficultyBreakdownItemResponse {
    pub difficulty: String,
    pub accuracy: f64,
    pub count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "McqQuestionItem")]
pub struct McqQuestionItemResponse {
    pub question_number: String,
    pub concept: String,
    pub difficulty: String,
    pub recall_accuracy: f64,
    pub attempts: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "McqRecallResponse")]
pub struct McqRecallResponse {
    pub overall_accuracy: f64,
    pub total_questions_attempted: i64,
    pub difficulty_breakdown: Vec<DifficultyBreakdownItemResponse>,
    pub questions: Vec<McqQuestionItemResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "MissingConceptItem")]
pub struct MissingConceptItemResponse {
    pub concept: String,
    pub percentage_missing: f64,
    pub ai_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "FreeRecallResponse")]
pub struct FreeRecallResponse {
    pub participation_rate: f64,
    pub ai_clarity_score: f64,
    pub average_response_length: i64,
    pub missing_concepts: Vec<MissingConceptItemResponse>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallStatus")]
#[serde(rename_all = "snake_case")]
pub enum RecallStatus {
    Remembered,
    Partial,
    Forgotten,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "MemoryGapItem")]
pub struct MemoryGapItemResponse {
    pub concept: String,
    pub recall_status: RecallStatus,
    pub confidence: f64,
    pub correctness: f64,
    #[ts(optional)]
    pub mismatch_alert: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "MemoryGapMapResponse")]
pub struct MemoryGapMapResponse {
    pub items: Vec<MemoryGapItemResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SuggestedActionItem")]
pub struct SuggestedActionItemResponse {
    pub id: String,
    pub icon: String,
    pub detected_issue: String,
    pub explanation: String,
    pub suggested_fix: String,
    pub primary_cta: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallTrendDataPoint")]
pub struct RecallTrendDataPointResponse {
    pub date: String,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallTrendsResponse")]
pub struct RecallTrendsResponse {
    pub recall_trend: Vec<RecallTrendDataPointResponse>,
    pub memory_decay_curve: Vec<RecallTrendDataPointResponse>,
    pub recall_by_difficulty: Vec<RecallTrendDataPointResponse>,
    pub retention_distribution: Vec<RecallTrendDataPointResponse>,
}

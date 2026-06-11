use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PracticeOverview")]
pub struct PracticeOverviewResponse {
    pub total_questions: i64,
    pub average_accuracy: f64,
    pub total_tests: i64,
    pub last_test_conducted: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "QuestionItem")]
pub struct QuestionItemResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub identifier: String,
    pub question: String,
    pub question_type: String,
    pub difficulty: String,
    #[ts(optional)]
    pub correct_rate: Option<f64>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "QuestionsResponse")]
pub struct QuestionsResponse {
    pub items: Vec<QuestionItemResponse>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
    pub total_pages: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicTestItem")]
pub struct TopicTestItemResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub title: String,
    pub status: String,
    pub questions_count: i64,
    pub difficulty_mix: String,
    #[ts(optional)]
    pub average_score: Option<f64>,
    pub attempts: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SignalType")]
#[serde(rename_all = "snake_case")]
pub enum SignalType {
    Positive,
    Warning,
    Negative,
    Info,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PracticeSignal")]
pub struct PracticeSignalResponse {
    pub id: String,
    pub message: String,
    pub signal_type: SignalType,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TestAnalytics")]
pub struct TestAnalyticsResponse {
    pub average_score_trend: Vec<TrendDataPointResponse>,
    pub attempts_trend: Vec<TrendDataPointResponse>,
    pub difficulty_distribution: Vec<DifficultyDistributionItem>,
    pub question_performance: Vec<QuestionPerformanceItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "DifficultyDistributionItem")]
pub struct DifficultyDistributionItem {
    pub difficulty: String,
    pub count: i64,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "QuestionPerformanceItem")]
pub struct QuestionPerformanceItem {
    #[schema(value_type = String)]
    pub question_id: Uuid,
    pub question: String,
    pub correct_rate: f64,
    pub attempts: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TrendDataPoint")]
pub struct TrendDataPointResponse {
    pub date: String,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateQuestionResponse")]
pub struct CreateQuestionResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub identifier: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateTestResponse")]
pub struct CreateTestResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub title: String,
    pub questions_count: i64,
}

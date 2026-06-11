use serde::Deserialize;
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "QuestionsQueryParams")]
pub struct QuestionsQueryParams {
    #[ts(optional)]
    pub search: Option<String>,
    #[ts(optional)]
    pub question_type: Option<String>,
    #[ts(optional)]
    pub difficulty: Option<String>,
    #[ts(optional)]
    pub status: Option<String>,
    #[ts(optional)]
    pub sort_by: Option<String>,
    #[ts(optional)]
    pub sort_order: Option<String>,
    #[ts(optional)]
    pub page: Option<i64>,
    #[ts(optional)]
    pub limit: Option<i64>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "CreateTestRequest")]
pub struct CreateTestRequest {
    pub title: String,
    #[ts(optional)]
    pub description: Option<String>,
    #[ts(optional)]
    pub instructions: Option<String>,
    #[ts(optional)]
    pub duration_minutes: Option<i32>,
    #[ts(optional)]
    pub passing_score: Option<f64>,
    #[ts(optional)]
    pub max_attempts: Option<i32>,
    #[ts(optional)]
    pub visibility: Option<String>,
    #[ts(optional)]
    pub status: Option<String>,
    pub question_ids: Vec<Uuid>,
}

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "CreateQuestionRequest")]
pub struct CreateQuestionRequest {
    pub question: String,
    pub question_type: String,
    pub difficulty: String,
    pub correct_answer: String,
    #[ts(optional)]
    pub explanation: Option<String>,
    #[ts(optional)]
    pub common_mistakes: Option<String>,
    #[ts(optional)]
    pub hints: Option<String>,
    #[ts(optional)]
    pub learning_objective: Option<String>,
    #[ts(optional)]
    pub estimated_time: Option<i32>,
    #[ts(optional)]
    pub status: Option<String>,
    #[ts(optional)]
    pub tags: Option<Vec<String>>,
    #[ts(optional)]
    pub choices: Option<Vec<String>>,
    #[ts(optional)]
    pub tolerance: Option<String>,
    #[ts(optional)]
    pub unit: Option<String>,
    #[ts(optional)]
    pub rubric: Option<String>,
    #[ts(optional)]
    pub evaluation_criteria: Option<String>,
    #[ts(optional)]
    pub assertion_reason_assertion: Option<String>,
    #[ts(optional)]
    pub assertion_reason_reason: Option<String>,
}

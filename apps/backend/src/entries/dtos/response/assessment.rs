use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "QuizResponse")]
pub struct QuizResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub time_limit_minutes: i32,
    pub passing_score: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "QuestionResponse")]
pub struct QuestionResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub quiz_id: Uuid,
    pub question_text: String,
    pub question_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AttemptResponse")]
pub struct AttemptResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    #[schema(value_type = String)]
    pub quiz_id: Uuid,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AnswerRequest")]
pub struct AnswerRequest {
    #[schema(value_type = String)]
    pub question_id: Uuid,
    pub answer: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AttemptResultResponse")]
pub struct AttemptResultResponse {
    #[schema(value_type = String)]
    pub attempt_id: Uuid,
    pub total_questions: usize,
    pub correct_answers: usize,
    pub score_percent: i32,
    pub passed: bool,
}

use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "NoteResponse")]
pub struct NoteResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub title: String,
    pub content: String,
    pub is_official: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ProgressResponse")]
pub struct ProgressResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub progress_percent: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallSessionResponse")]
pub struct RecallSessionResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallQuestionResponse")]
pub struct RecallQuestionResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallAnswerRequest")]
pub struct RecallAnswerRequest {
    #[schema(value_type = String)]
    pub question_id: Uuid,
    pub selected_option: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecallResultResponse")]
pub struct RecallResultResponse {
    #[schema(value_type = String)]
    pub session_id: Uuid,
    pub total_questions: usize,
    pub correct_answers: usize,
    pub score_percent: i32,
}

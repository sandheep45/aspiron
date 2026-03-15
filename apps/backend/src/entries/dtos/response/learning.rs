use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "NoteResponse")]
pub struct NoteResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
    pub content: String,
    pub is_official: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "ProgressResponse")]
pub struct ProgressResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub progress_percent: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RecallSessionResponse")]
pub struct RecallSessionResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RecallQuestionResponse")]
pub struct RecallQuestionResponse {
    pub id: Uuid,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RecallAnswerRequest")]
pub struct RecallAnswerRequest {
    pub question_id: Uuid,
    pub selected_option: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RecallResultResponse")]
pub struct RecallResultResponse {
    pub session_id: Uuid,
    pub total_questions: usize,
    pub correct_answers: usize,
    pub score_percent: i32,
}

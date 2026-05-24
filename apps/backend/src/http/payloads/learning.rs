use serde::Deserialize;
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateNoteRequest")]
pub struct CreateNoteRequest {
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub title: String,
    pub content: String,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "UpdateNoteRequest")]
pub struct UpdateNoteRequest {
    pub title: Option<String>,
    pub content: Option<String>,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "UpdateProgressRequest")]
pub struct UpdateProgressRequest {
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub progress_percent: i32,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "StartRecallRequest")]
pub struct StartRecallRequest {
    #[schema(value_type = String)]
    pub topic_id: Uuid,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubmitRecallAnswerRequest")]
pub struct SubmitRecallAnswerRequest {
    #[schema(value_type = String)]
    pub question_id: Uuid,
    pub selected_option: usize,
}

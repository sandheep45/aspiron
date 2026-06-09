use serde::Deserialize;
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateThreadRequest")]
pub struct CreateThreadRequest {
    pub title: String,
    pub content: String,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreatePostRequest")]
pub struct CreatePostRequest {
    pub content: String,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AttachNoteRequest")]
pub struct AttachNoteRequest {
    #[schema(value_type = String)]
    pub note_id: Uuid,
}

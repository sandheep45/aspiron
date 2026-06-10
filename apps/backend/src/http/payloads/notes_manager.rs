use serde::Deserialize;
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateReferencePayload")]
pub struct CreateReferencePayload {
    pub title: String,
    pub source: String,
    pub reference_type: String,
    pub url: String,
}

#[derive(Debug, Clone, Deserialize, TS, ToSchema)]
#[ts(export, rename = "UpdateTeacherNotePayload")]
pub struct UpdateTeacherNotePayload {
    pub content: String,
    pub status: Option<String>,
}

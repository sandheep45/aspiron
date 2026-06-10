use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "NotesOverview")]
pub struct NotesOverviewResponse {
    pub teacher_notes_status: String,
    pub ai_notes_status: String,
    pub external_references_count: i32,
    pub student_engagement: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TeacherNote")]
pub struct TeacherNoteResponse {
    pub id: String,
    pub content: String,
    pub status: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AiNote")]
pub struct AiNoteResponse {
    pub id: String,
    pub title: String,
    pub content: String,
    pub status: String,
    pub generated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "Reference")]
pub struct ReferenceResponse {
    pub id: String,
    pub title: String,
    pub source: String,
    pub reference_type: String,
    pub url: String,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "CreateReferenceRequest")]
pub struct CreateReferenceRequest {
    pub title: String,
    pub source: String,
    pub reference_type: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "UpdateTeacherNoteRequest")]
pub struct UpdateTeacherNoteRequest {
    pub content: String,
    pub status: Option<String>,
}

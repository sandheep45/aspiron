use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "LiveSessionResponse")]
pub struct LiveSessionResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub title: String,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub scheduled_at: DateTimeWithTimeZone,
    pub instructor: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "LiveClassResponse")]
pub struct LiveClassResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub scheduled_at: DateTimeWithTimeZone,
    pub duration_min: i32,
    pub provider: String,
    pub join_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RecordingResponse")]
pub struct RecordingResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub session_id: Uuid,
    pub recording_url: String,
}

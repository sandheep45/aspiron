use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "LiveSessionResponse")]
pub struct LiveSessionResponse {
    pub id: Uuid,
    pub title: String,
    pub scheduled_at: DateTimeWithTimeZone,
    pub instructor: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "LiveClassResponse")]
pub struct LiveClassResponse {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub scheduled_at: DateTimeWithTimeZone,
    pub duration_min: i32,
    pub provider: String,
    pub join_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RecordingResponse")]
pub struct RecordingResponse {
    pub id: Uuid,
    pub session_id: Uuid,
    pub recording_url: String,
}

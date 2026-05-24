use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubjectDto")]
pub struct SubjectResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub icon_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ChapterDto")]
pub struct ChapterResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    #[schema(value_type = String)]
    pub subject_id: Uuid,
    pub order_number: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicDto")]
pub struct TopicResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    #[schema(value_type = String)]
    pub chapter_id: Uuid,
    pub order_number: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "VideoDto")]
pub struct VideoResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub topic_id: Uuid,
    pub title: String,
    pub duration_seconds: i32,
    pub video_url: String,
    pub transcript: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "OfflineTokenResponse")]
pub struct OfflineTokenResponse {
    pub offline_token: String,
    #[schema(value_type = String)]
    pub expires_at: String,
}

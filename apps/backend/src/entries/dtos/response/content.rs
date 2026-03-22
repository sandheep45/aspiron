use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubjectDto")]
pub struct SubjectDto {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub icon_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ChaptersResponse")]
pub struct ChaptersResponse {
    pub chapters: Vec<ChapterDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ChapterDto")]
pub struct ChapterDto {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    #[schema(value_type = String)]
    pub subject_id: Uuid,
    pub order_number: i32,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicsResponse")]
pub struct TopicsResponse {
    pub topics: Vec<TopicDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicDto")]
pub struct TopicDto {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    #[schema(value_type = String)]
    pub chapter_id: Uuid,
    pub order_number: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "VideosResponse")]
pub struct VideosResponse {
    pub videos: Vec<VideoDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "VideoDto")]
pub struct VideoDto {
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
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub expires_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PlaybackTokenResponse")]
pub struct PlaybackTokenResponse {
    pub playback_token: String,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub expires_at: DateTimeWithTimeZone,
}

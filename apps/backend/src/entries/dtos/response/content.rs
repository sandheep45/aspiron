use crate::entries::entitiy_enums::exam_types::ExamTypeEnums;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "SubjectsResponse")]
pub struct SubjectsResponse {
    pub subjects: Vec<SubjectDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "SubjectDto")]
pub struct SubjectDto {
    pub id: Uuid,
    pub name: String,
    pub exam_type: ExamTypeEnums,
    #[ts(type = "Date")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "ChaptersResponse")]
pub struct ChaptersResponse {
    pub chapters: Vec<ChapterDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "ChapterDto")]
pub struct ChapterDto {
    pub id: Uuid,
    pub name: String,
    pub subject_id: Uuid,
    pub order_number: i32,
    #[ts(type = "Date")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "TopicsResponse")]
pub struct TopicsResponse {
    pub topics: Vec<TopicDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "TopicDto")]
pub struct TopicDto {
    pub id: Uuid,
    pub name: String,
    pub chapter_id: Uuid,
    pub order_number: i32,
    #[ts(type = "Date")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "VideosResponse")]
pub struct VideosResponse {
    pub videos: Vec<VideoDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "VideoDto")]
pub struct VideoDto {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
    pub duration_seconds: i32,
    pub video_url: String,
    pub transcript: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "OfflineTokenResponse")]
pub struct OfflineTokenResponse {
    pub offline_token: String,
    #[ts(type = "Date")]
    pub expires_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "PlaybackTokenResponse")]
pub struct PlaybackTokenResponse {
    pub playback_token: String,
    #[ts(type = "Date")]
    pub expires_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "OfficialNotesResponse")]
pub struct OfficialNotesResponse {
    pub notes: Vec<crate::entries::dtos::response::learning::NoteDto>,
    pub pagination: Option<crate::entries::dtos::response::common::PaginationInfo>,
}

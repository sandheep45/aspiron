use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicSummary")]
pub struct TopicSummaryResponse {
    pub chapter_name: String,
    pub total_topics: i64,
    pub published_topics: i64,
    pub draft_topics: i64,
    pub weak_topics: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicItem")]
pub struct TopicItemResponse {
    pub id: String,
    pub name: String,
    pub content_status: String,
    pub video_available: bool,
    pub recall_strength: String,
    pub practice_accuracy: f64,
    pub last_activity: String,
    pub status: String,
}

// Not TS-exported to avoid collision with chapters_page::InsightItemResponse (identical structure)
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct InsightItemResponse {
    pub id: String,
    #[serde(rename = "type")]
    pub signal_type: String,
    pub title: String,
    pub description: String,
}

use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ChapterSummary")]
pub struct ChapterSummaryResponse {
    pub subject_name: String,
    pub total_chapters: i64,
    pub published_topics: i64,
    pub draft_topics: i64,
    pub chapters_needing_attention: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ChapterItem")]
pub struct ChapterItemResponse {
    pub id: String,
    pub name: String,
    pub published_topics: i64,
    pub total_topics: i64,
    pub coverage: f64,
    pub avg_recall: String,
    pub practice_accuracy: f64,
    pub status: String,
    pub last_updated: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "InsightItem")]
pub struct InsightItemResponse {
    pub id: String,
    #[serde(rename = "type")]
    #[ts(rename = "type")]
    pub signal_type: String,
    pub title: String,
    pub description: String,
}

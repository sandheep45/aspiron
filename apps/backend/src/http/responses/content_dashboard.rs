use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ContentDashboardSummary")]
pub struct ContentDashboardSummaryResponse {
    pub subjects_covered: i64,
    pub topics_published: i64,
    pub topics_in_draft: i64,
    pub topics_flagged: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ContentDashboardAttentionItem")]
pub struct ContentDashboardAttentionItem {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub topic: String,
    pub issue: String,
    pub reason: String,
    pub students_affected: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ContentDashboardAttentionResponse")]
pub struct ContentDashboardAttentionResponse {
    pub total: i64,
    pub items: Vec<ContentDashboardAttentionItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ContentDashboardSubjectProgress")]
pub struct ContentDashboardSubjectProgress {
    pub id: String,
    pub name: String,
    pub completion: f64,
    pub total_topics: i64,
    pub published_topics: i64,
    pub draft_topics: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ContentDashboardSignalItem")]
pub struct ContentDashboardSignalItem {
    pub topic: String,
    #[ts(optional)]
    pub score: Option<f64>,
    #[ts(optional)]
    pub drop: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ContentDashboardSignalsResponse")]
pub struct ContentDashboardSignalsResponse {
    pub highest_recall: Vec<ContentDashboardSignalItem>,
    pub fastest_decay: Vec<ContentDashboardSignalItem>,
}

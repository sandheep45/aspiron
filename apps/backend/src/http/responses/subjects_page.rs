use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubjectPageItem")]
pub struct SubjectPageItem {
    pub id: String,
    pub name: String,
    pub chapters_count: i64,
    pub topics_published: i64,
    pub coverage: f64,
    #[ts(optional)]
    pub average_recall: Option<f64>,
    #[ts(optional)]
    pub practice_accuracy: Option<f64>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubjectSummary")]
pub struct SubjectSummary {
    pub total_subjects: i64,
    pub total_topics: i64,
    pub published_topics: i64,
    pub topics_needing_attention: i64,
    pub descriptions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubjectSignalType")]
#[serde(rename_all = "lowercase")]
pub enum SubjectSignalType {
    Positive,
    Negative,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SubjectSignal")]
pub struct SubjectSignal {
    pub subject_name: String,
    pub message: String,
    pub signal_type: SubjectSignalType,
}

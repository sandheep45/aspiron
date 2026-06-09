use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicOverview")]
pub struct TopicOverviewResponse {
    pub recall_strength: String,
    pub practice_accuracy: f64,
    pub dropoff_indicator: String,
    pub engagement_trend: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicIssue")]
pub struct TopicIssueResponse {
    pub id: String,
    pub title: String,
    pub severity: String,
    pub description: String,
    pub recommendation: String,
    pub action_label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicComponent")]
pub struct TopicComponentResponse {
    pub id: String,
    pub name: String,
    pub status: String,
    pub performance: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicAction")]
pub struct TopicActionResponse {
    pub id: String,
    pub label: String,
    #[ts(optional)]
    pub description: Option<String>,
    #[ts(optional)]
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TrendDataPoint")]
pub struct TrendDataPointResponse {
    pub date: String,
    pub value: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TopicTrends")]
pub struct TopicTrendsResponse {
    pub recall_trend: Vec<TrendDataPointResponse>,
    pub practice_accuracy_trend: Vec<TrendDataPointResponse>,
    pub engagement_trend: Vec<TrendDataPointResponse>,
    pub completion_trend: Vec<TrendDataPointResponse>,
}

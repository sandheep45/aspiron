use serde::Deserialize;
use ts_rs::TS;

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "TopicsQueryParams")]
pub struct TopicsQueryParams {
    #[ts(optional)]
    pub search: Option<String>,
    #[ts(optional)]
    pub sort_by: Option<String>,
    #[ts(optional)]
    pub sort_order: Option<String>,
    #[ts(optional)]
    pub status_filter: Option<String>,
    #[ts(optional)]
    pub content_status_filter: Option<String>,
    #[ts(optional)]
    pub recall_filter: Option<String>,
    #[ts(optional)]
    pub video_filter: Option<String>,
    #[ts(optional)]
    pub page: Option<i64>,
    #[ts(optional)]
    pub limit: Option<i64>,
}

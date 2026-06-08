use serde::Deserialize;
use ts_rs::TS;

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "ChaptersQueryParams")]
pub struct ChaptersQueryParams {
    #[ts(optional)]
    pub search: Option<String>,
    #[ts(optional)]
    pub sort_by: Option<String>,
    #[ts(optional)]
    pub sort_order: Option<String>,
    #[ts(optional)]
    pub page: Option<i64>,
    #[ts(optional)]
    pub limit: Option<i64>,
}

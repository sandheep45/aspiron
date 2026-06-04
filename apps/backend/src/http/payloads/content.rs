use serde::Deserialize;
use ts_rs::TS;

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "AttentionQueryParams")]
pub struct AttentionQueryParams {
    #[ts(optional)]
    pub sort_by: Option<String>,
    #[ts(optional)]
    pub sort_order: Option<String>,
    #[ts(optional)]
    pub search: Option<String>,
    #[ts(optional)]
    pub issue: Option<String>,
    #[ts(optional)]
    pub page: Option<u32>,
    #[ts(optional)]
    pub limit: Option<u32>,
}

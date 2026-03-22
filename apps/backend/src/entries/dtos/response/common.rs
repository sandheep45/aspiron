use serde::de;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS, ToSchema)]
#[serde(rename_all = "lowercase")]
#[ts(export, rename = "SortOrder")]
pub enum SortOrder {
    #[ts(rename = "asc")]
    Asc,
    #[ts(rename = "desc")]
    Desc,
}

#[derive(Debug, Clone, Serialize, TS, ToSchema, IntoParams)]
#[ts(export, rename = "PaginationPayload")]
pub struct PaginationPayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    #[ts(optional)]
    #[param(example = 1)]
    pub page: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[ts(optional)]
    #[param(example = 20)]
    pub limit: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[ts(optional)]
    #[param(example = "search term")]
    pub search: Option<String>,
}

impl<'de> Deserialize<'de> for PaginationPayload {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct Helper {
            #[serde(default)]
            page: Option<String>,
            #[serde(default)]
            limit: Option<String>,
            #[serde(default)]
            search: Option<String>,
        }

        let helper = Helper::deserialize(deserializer)?;

        let page = match &helper.page {
            Some(s) => Some(
                s.parse::<u32>()
                    .map_err(|_| de::Error::custom("invalid page"))?,
            ),
            None => None,
        };

        let limit = match &helper.limit {
            Some(s) => Some(
                s.parse::<u32>()
                    .map_err(|_| de::Error::custom("invalid limit"))?,
            ),
            None => None,
        };

        Ok(PaginationPayload {
            page,
            limit,
            search: helper.search,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PaginationResponse")]
pub struct PaginationResponse {
    pub page: u32,
    pub limit: u32,
    pub total: u64,
    pub filtered_total: u64,
    pub total_pages: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "SuccessResponse")]
pub struct SuccessResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "ErrorResponse")]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
}

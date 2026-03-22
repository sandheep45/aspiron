use serde::Deserialize;
use serde::de;
use ts_rs::TS;
use utoipa::IntoParams;

use crate::entries::dtos::response::common::{PaginationPayload, SortOrder};
use crate::entries::dtos::response::insights::{InsightType, Severity};

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize, TS, utoipa::ToSchema,
)]
#[serde(rename_all = "snake_case")]
#[ts(export, rename = "InsightsSortBy")]
pub enum InsightsSortBy {
    #[serde(rename = "detected_at")]
    #[ts(rename = "detected_at")]
    DetectedAt,
    #[serde(rename = "severity")]
    #[ts(rename = "severity")]
    Severity,
}

#[derive(Debug, Clone, TS, IntoParams, utoipa::ToSchema)]
#[ts(export, rename = "InsightFilters")]
pub struct InsightFilters {
    #[ts(optional)]
    pub severity: Option<Severity>,
    #[ts(optional)]
    pub insight_type: Option<InsightType>,
    #[ts(optional)]
    pub start: Option<i64>,
    #[ts(optional)]
    pub end: Option<i64>,
}

impl<'de> Deserialize<'de> for InsightFilters {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct Helper {
            severity: Option<String>,
            insight_type: Option<String>,
            start: Option<String>,
            end: Option<String>,
        }

        let helper = Helper::deserialize(deserializer)?;

        let severity = helper
            .severity
            .map(|s| {
                serde_json::from_str(&format!("\"{}\"", s))
                    .map_err(|_| de::Error::custom("invalid severity"))
            })
            .transpose()?;

        let insight_type = helper
            .insight_type
            .map(|s| {
                serde_json::from_str(&format!("\"{}\"", s))
                    .map_err(|_| de::Error::custom("invalid insight_type"))
            })
            .transpose()?;

        let start = helper
            .start
            .map(|s| {
                s.parse::<i64>()
                    .map_err(|_| de::Error::custom("invalid start"))
            })
            .transpose()?;

        let end = helper
            .end
            .map(|s| {
                s.parse::<i64>()
                    .map_err(|_| de::Error::custom("invalid end"))
            })
            .transpose()?;

        Ok(InsightFilters {
            severity,
            insight_type,
            start,
            end,
        })
    }
}

#[derive(Debug, Clone, TS, IntoParams, utoipa::ToSchema)]
#[ts(export, rename = "InsightSort")]
pub struct InsightSort {
    #[ts(optional)]
    pub sort_by: Option<InsightsSortBy>,
    #[ts(optional)]
    pub sort_order: Option<SortOrder>,
}

impl<'de> Deserialize<'de> for InsightSort {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        #[derive(Deserialize)]
        struct Helper {
            sort_by: Option<String>,
            sort_order: Option<String>,
        }

        let helper = Helper::deserialize(deserializer)?;

        let sort_by = helper
            .sort_by
            .map(|s| {
                serde_json::from_str(&format!("\"{}\"", s))
                    .map_err(|_| de::Error::custom("invalid sort_by"))
            })
            .transpose()?;

        let sort_order = helper
            .sort_order
            .map(|s| {
                serde_json::from_str(&format!("\"{}\"", s))
                    .map_err(|_| de::Error::custom("invalid sort_order"))
            })
            .transpose()?;

        Ok(InsightSort {
            sort_by,
            sort_order,
        })
    }
}

#[derive(Debug, Clone, Deserialize, TS, IntoParams)]
#[ts(export, rename = "InsightsQueryParams")]
pub struct InsightsQueryParams {
    #[serde(flatten)]
    pub pagination: PaginationPayload,

    #[serde(flatten)]
    pub filter: InsightFilters,

    #[serde(flatten)]
    pub sort: InsightSort,
}

impl InsightsQueryParams {
    pub fn get_page(&self) -> u32 {
        self.pagination.page.unwrap_or(1)
    }

    pub fn get_limit(&self) -> u32 {
        self.pagination.limit.unwrap_or(20).min(100)
    }

    pub fn get_offset(&self) -> u32 {
        (self.get_page() - 1) * self.get_limit()
    }

    pub fn get_time_window(
        &self,
    ) -> (chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>) {
        let now = chrono::Utc::now();
        let default_start = now - chrono::Duration::days(7);

        let start = self
            .filter
            .start
            .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
            .unwrap_or(default_start);

        let end = self
            .filter
            .end
            .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
            .unwrap_or(now);

        (start, end)
    }
}

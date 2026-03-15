use serde::Deserialize;
use ts_rs::TS;

#[derive(Debug, Deserialize, TS)]
#[ts(export, rename = "InsightsQueryParams")]
pub struct InsightsQueryParams {
    #[serde(default)]
    pub start: Option<i64>,
    #[serde(default)]
    pub end: Option<i64>,
}

impl InsightsQueryParams {
    pub fn get_time_window(
        &self,
    ) -> (chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>) {
        let now = chrono::Utc::now();
        let default_start = now - chrono::Duration::days(7);

        let start = self
            .start
            .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
            .unwrap_or(default_start);

        let end = self
            .end
            .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
            .unwrap_or(now);

        (start, end)
    }
}

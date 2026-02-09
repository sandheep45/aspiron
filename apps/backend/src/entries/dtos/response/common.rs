use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "PaginationInfo")]
pub struct PaginationInfo {
    pub page: u32,
    pub limit: u32,
    pub total: u64,
    pub total_pages: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "SuccessResponse")]
pub struct SuccessResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "ErrorResponse")]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
    pub code: Option<String>,
}

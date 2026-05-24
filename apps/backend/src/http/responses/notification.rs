use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "NotificationResponse")]
pub struct NotificationResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    pub title: String,
    pub message: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "NotificationListResponse")]
pub struct NotificationListResponse {
    pub notifications: Vec<NotificationResponse>,
    pub total_count: usize,
}

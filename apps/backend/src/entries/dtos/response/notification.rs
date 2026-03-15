use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "NotificationResponse")]
pub struct NotificationResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub title: String,
    pub message: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "NotificationListResponse")]
pub struct NotificationListResponse {
    pub notifications: Vec<NotificationResponse>,
    pub total_count: usize,
}

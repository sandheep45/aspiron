use chrono::{DateTime, Utc};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct NotificationEvent {
    pub id: Uuid,
    pub user_id: Uuid,
    pub payload: Value,
    pub event_type: String,
    pub scheduled_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NotificationLog {
    pub id: Uuid,
    pub event_id: Uuid,
    pub status: String,
    pub sent_at: DateTime<Utc>,
}

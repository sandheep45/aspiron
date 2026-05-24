use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Thread {
    pub id: Uuid,
    pub user_id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct Post {
    pub id: Uuid,
    pub user_id: Uuid,
    pub thread_id: Uuid,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct BotEvent {
    pub id: Uuid,
    pub thread_id: Uuid,
    pub event_type: String,
    pub payload: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

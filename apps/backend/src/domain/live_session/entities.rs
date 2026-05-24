use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct LiveSession {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub scheduled_at: DateTime<Utc>,
    pub duration_min: i32,
    pub provider: String,
    pub join_url: String,
}

#[derive(Debug, Clone)]
pub struct Recording {
    pub id: Uuid,
    pub session_id: Uuid,
    pub recording_url: String,
    pub created_at: DateTime<Utc>,
}

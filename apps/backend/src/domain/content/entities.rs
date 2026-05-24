use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Subject {
    pub id: Uuid,
    pub name: String,
    pub exam_type: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct Chapter {
    pub id: Uuid,
    pub name: String,
    pub subject_id: Uuid,
    pub order_number: i32,
}

#[derive(Debug, Clone)]
pub struct Topic {
    pub id: Uuid,
    pub name: String,
    pub chapter_id: Uuid,
    pub order_number: i32,
}

#[derive(Debug, Clone)]
pub struct Video {
    pub id: Uuid,
    pub topic_id: Uuid,
    pub title: String,
    pub duration_seconds: i32,
    pub video_url: String,
    pub transcript: Option<String>,
}

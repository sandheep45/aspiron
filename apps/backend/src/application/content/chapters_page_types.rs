use chrono::{DateTime, Utc};
use uuid::Uuid;

pub struct ChapterWithMetrics {
    pub id: Uuid,
    pub name: String,
    pub subject_id: Uuid,
    pub published_topics: i64,
    pub total_topics: i64,
    pub coverage: f64,
    pub avg_recall: Option<f64>,
    pub practice_accuracy: Option<f64>,
    pub last_activity_at: Option<DateTime<Utc>>,
}

pub struct ChapterSummaryData {
    pub subject_name: String,
    pub total_chapters: i64,
    pub published_topics: i64,
    pub draft_topics: i64,
    pub chapters_needing_attention: i64,
}

pub struct ChapterInsightData {
    pub id: String,
    pub signal_type: String,
    pub title: String,
    pub description: String,
}

use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::content::entities::{Chapter, Subject, Topic, Video};
use crate::domain::content::value_objects::OfflineToken;
use crate::setup::error::AppError;

#[async_trait]
pub trait ContentRepository: Send + Sync {
    async fn get_subjects(&self) -> Result<Vec<Subject>, AppError>;
    async fn get_chapters_by_subject(&self, subject_id: Uuid) -> Result<Vec<Chapter>, AppError>;
    async fn get_topics_by_chapter(&self, chapter_id: Uuid) -> Result<Vec<Topic>, AppError>;
    async fn get_topic_by_id(&self, topic_id: Uuid) -> Result<Topic, AppError>;
    async fn get_videos_by_topic(&self, topic_id: Uuid) -> Result<Vec<Video>, AppError>;
    async fn get_offline_token(&self, video_id: Uuid) -> Result<OfflineToken, AppError>;
}

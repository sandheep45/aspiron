use async_trait::async_trait;
use uuid::Uuid;

use crate::application::content::chapters_page_types::{
    ChapterInsightData, ChapterSummaryData, ChapterWithMetrics,
};
use crate::application::content::topics_page_types::{
    TopicInsightData, TopicSummaryData, TopicWithMetrics,
};
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

    async fn get_subject_by_id(&self, subject_id: Uuid) -> Result<Subject, AppError>;
    async fn get_chapter_by_id(&self, chapter_id: Uuid) -> Result<Chapter, AppError>;
    async fn get_topics_by_chapter_ids(
        &self,
        chapter_ids: Vec<Uuid>,
    ) -> Result<Vec<Topic>, AppError>;
    async fn get_chapter_summary(&self, subject_id: Uuid) -> Result<ChapterSummaryData, AppError>;
    async fn get_chapters_with_metrics(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<ChapterWithMetrics>, AppError>;
    async fn get_chapter_insights(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<ChapterInsightData>, AppError>;

    async fn get_topic_summary(&self, chapter_id: Uuid) -> Result<TopicSummaryData, AppError>;
    async fn get_topics_with_metrics(
        &self,
        chapter_id: Uuid,
    ) -> Result<Vec<TopicWithMetrics>, AppError>;
    async fn get_topic_insights(&self, chapter_id: Uuid)
    -> Result<Vec<TopicInsightData>, AppError>;
}

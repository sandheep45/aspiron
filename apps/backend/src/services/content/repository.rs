use std::sync::Arc;

use sea_orm::{DatabaseConnection, EntityTrait};
use uuid::Uuid;

use crate::entries::dtos::response::content::{
    ChapterDto, OfflineTokenResponse, SubjectDto, TopicDto, VideoDto,
};
use crate::entries::entities::content_subject::Entity as ContentSubjectEntity;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct ContentRepository {
    db: Arc<DatabaseConnection>,
}

impl ContentRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_subjects(&self) -> Result<Vec<SubjectDto>, AppError> {
        let subjects = ContentSubjectEntity::find()
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(subjects
            .into_iter()
            .map(|s| SubjectDto {
                id: s.id,
                name: s.name,
                description: None,
                icon_url: None,
            })
            .collect())
    }

    pub async fn get_chapters_by_subject(
        &self,
        _subject_id: Uuid,
    ) -> Result<Vec<ChapterDto>, AppError> {
        todo!()
    }

    pub async fn get_topics_by_chapter(
        &self,
        _chapter_id: Uuid,
    ) -> Result<Vec<TopicDto>, AppError> {
        todo!()
    }

    pub async fn get_videos_by_topic(&self, _topic_id: Uuid) -> Result<Vec<VideoDto>, AppError> {
        todo!()
    }

    pub async fn get_offline_token(
        &self,
        _video_id: Uuid,
    ) -> Result<OfflineTokenResponse, AppError> {
        todo!()
    }
}

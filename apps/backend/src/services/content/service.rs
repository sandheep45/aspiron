use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::setup::error::AppError;

#[derive(Clone)]
pub struct ContentService {
    // repository: ContentRepository,
}

impl ContentService {
    pub fn new(_db: Arc<DatabaseConnection>) -> Self {
        Self {
            // repository: ContentRepository::new(db),
        }
    }

    pub async fn get_subjects(&self) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_chapters_by_subject(
        &self,
        _subject_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_topics_by_chapter(
        &self,
        _chapter_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_videos_by_topic(&self, _topic_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_offline_token(&self, _video_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }
}

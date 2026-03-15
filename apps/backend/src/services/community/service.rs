use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::setup::error::AppError;

#[derive(Clone)]
pub struct CommunityService {
    // repository: CommunityRepository,
}

impl CommunityService {
    pub fn new(_db: Arc<DatabaseConnection>) -> Self {
        Self {
            // repository: CommunityRepository::new(db),
        }
    }

    pub async fn create_thread(
        &self,
        _user_id: Uuid,
        _title: String,
        _content: String,
        _topic_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_threads_by_topic(
        &self,
        _topic_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_thread_by_id(&self, _thread_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn create_post(
        &self,
        _user_id: Uuid,
        _thread_id: Uuid,
        _content: String,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn attach_note_to_thread(
        &self,
        _user_id: Uuid,
        _thread_id: Uuid,
        _note_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }
}

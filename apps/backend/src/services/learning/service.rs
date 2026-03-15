use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::setup::error::AppError;

#[derive(Clone)]
pub struct LearningService {
    // repository: LearningRepository,
}

impl LearningService {
    pub fn new(_db: Arc<DatabaseConnection>) -> Self {
        Self {
            // repository: LearningRepository::new(db),
        }
    }

    pub async fn get_all_notes(&self, _user_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn create_note(
        &self,
        _user_id: Uuid,
        _title: String,
        _content: String,
        _topic_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn update_note(
        &self,
        _note_id: Uuid,
        _title: Option<String>,
        _content: Option<String>,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn delete_note(&self, _note_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_teachers_notes(&self, _topic_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_progress(
        &self,
        _user_id: Uuid,
        _topic_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn update_progress(
        &self,
        _user_id: Uuid,
        _topic_id: Uuid,
        _progress_percent: i32,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn start_recall_session(
        &self,
        _user_id: Uuid,
        _topic_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_recall_mcqs(&self, _session_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn submit_recall_mcq(
        &self,
        _session_id: Uuid,
        _answers: Vec<crate::entries::dtos::response::learning::RecallAnswerRequest>,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_recall_result(&self, _session_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }
}

use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::setup::error::AppError;

#[derive(Clone)]
pub struct LiveSessionService {
    // repository: LiveSessionRepository,
}

impl LiveSessionService {
    pub fn new(_db: Arc<DatabaseConnection>) -> Self {
        Self {
            // repository: LiveSessionRepository::new(db),
        }
    }

    pub async fn get_upcoming_classes(&self) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn join_class(
        &self,
        _user_id: Uuid,
        _class_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_recorded_sessions(
        &self,
        _class_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }
}

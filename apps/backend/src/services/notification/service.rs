use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::setup::error::AppError;

#[derive(Clone)]
pub struct NotificationService {
    // repository: NotificationRepository,
}

impl NotificationService {
    pub fn new(_db: Arc<DatabaseConnection>) -> Self {
        Self {
            // repository: NotificationRepository::new(db),
        }
    }

    pub async fn get_all_notifications(
        &self,
        _user_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn update_notification_status(
        &self,
        _user_id: Uuid,
        _notification_id: Uuid,
        _status: String,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }
}

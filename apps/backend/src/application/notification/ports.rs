use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::notification::entities::{NotificationEvent, NotificationLog};
use crate::setup::error::AppError;

#[async_trait]
pub trait NotificationRepository: Send + Sync {
    async fn get_notifications_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<NotificationLog>, AppError>;
    async fn update_status(
        &self,
        notification_id: Uuid,
        status: String,
    ) -> Result<NotificationLog, AppError>;
    async fn create_event(
        &self,
        user_id: Uuid,
        payload: serde_json::Value,
        event_type: String,
    ) -> Result<NotificationEvent, AppError>;
}

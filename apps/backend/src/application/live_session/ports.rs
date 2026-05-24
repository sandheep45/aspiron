use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::live_session::entities::{LiveSession, Recording};
use crate::setup::error::AppError;

#[async_trait]
pub trait LiveSessionRepository: Send + Sync {
    async fn get_upcoming_classes(&self) -> Result<Vec<LiveSession>, AppError>;
    async fn join_class(&self, user_id: Uuid, class_id: Uuid) -> Result<LiveSession, AppError>;
    async fn get_recorded_sessions(&self, class_id: Uuid) -> Result<Vec<Recording>, AppError>;
}

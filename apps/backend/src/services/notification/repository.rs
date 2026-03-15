use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, Iden, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::notification::NotificationResponse;
use crate::entries::entities::notification_log::Entity as NotificationLogEntity;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct NotificationRepository {
    db: Arc<DatabaseConnection>,
}

impl NotificationRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_notifications_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<NotificationResponse>, AppError> {
        let notifications = NotificationLogEntity::find()
            .filter(crate::entries::entities::notification_log::Column::EventId.eq(user_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(notifications
            .into_iter()
            .map(|n| NotificationResponse {
                id: n.id,
                user_id: n.event_id,
                title: String::new(),
                message: String::new(),
                status: n.status.to_string(),
            })
            .collect())
    }

    pub async fn update_status(
        &self,
        _notification_id: Uuid,
        _status: String,
    ) -> Result<NotificationResponse, AppError> {
        todo!()
    }
}

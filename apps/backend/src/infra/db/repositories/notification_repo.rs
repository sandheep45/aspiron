use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::application::notification::ports::NotificationRepository;
use crate::domain::notification::entities::{NotificationEvent, NotificationLog};
use crate::entries::entities::notification_log;
use crate::entries::entity_enums::notification_logs_types::NotificationLogsTypesEnum;
use crate::setup::error::AppError;

pub struct SeaOrmNotificationRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmNotificationRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl NotificationRepository for SeaOrmNotificationRepository {
    async fn get_notifications_by_user(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<NotificationLog>, AppError> {
        let logs = notification_log::Entity::find()
            .filter(notification_log::Column::EventId.eq(user_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(logs.into_iter().map(map_log_orm_to_domain).collect())
    }

    async fn update_status(
        &self,
        _notification_id: Uuid,
        _status: String,
    ) -> Result<NotificationLog, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: update_status"
        )))
    }

    async fn create_event(
        &self,
        _user_id: Uuid,
        _payload: serde_json::Value,
        _event_type: String,
    ) -> Result<NotificationEvent, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: create_event"
        )))
    }
}

fn map_log_orm_to_domain(l: notification_log::Model) -> NotificationLog {
    NotificationLog {
        id: l.id,
        event_id: l.event_id,
        status: status_to_string(&l.status),
        sent_at: l.sent_at.into(),
    }
}

fn status_to_string(status: &NotificationLogsTypesEnum) -> String {
    match status {
        NotificationLogsTypesEnum::SENT => "sent".to_string(),
        NotificationLogsTypesEnum::SKIPPED => "skipped".to_string(),
        NotificationLogsTypesEnum::FAILED => "failed".to_string(),
    }
}

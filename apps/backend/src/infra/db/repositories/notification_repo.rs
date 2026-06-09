use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::application::notification::ports::NotificationRepository;
use crate::domain::notification::entities::{NotificationEvent, NotificationLog};
use crate::entries::entities::{notification_event, notification_log};
use crate::entries::entity_enums::notification_logs_types::NotificationLogsTypesEnum;
use crate::setup::error::AppError;

pub(crate) struct SeaOrmNotificationRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmNotificationRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
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
        notification_id: Uuid,
        status: String,
    ) -> Result<NotificationLog, AppError> {
        let log = notification_log::Entity::find_by_id(notification_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Notification log not found"))?;

        let status_enum = match status.as_str() {
            "sent" => NotificationLogsTypesEnum::SENT,
            "skipped" => NotificationLogsTypesEnum::SKIPPED,
            "failed" => NotificationLogsTypesEnum::FAILED,
            _ => return Err(AppError::validation("Invalid notification status")),
        };

        let mut active: notification_log::ActiveModel = log.into();
        active.status = Set(status_enum);

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_log_active_to_domain(result))
    }

    async fn create_event(
        &self,
        user_id: Uuid,
        payload: serde_json::Value,
        event_type: String,
    ) -> Result<NotificationEvent, AppError> {
        let active = notification_event::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            payload: Set(payload),
            r#type: Set(event_type),
            scheduled_at: Set(chrono::Utc::now().into()),
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_event_active_to_domain(result))
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

fn map_log_active_to_domain(l: notification_log::ActiveModel) -> NotificationLog {
    NotificationLog {
        id: l.id.clone().unwrap(),
        event_id: l.event_id.clone().unwrap(),
        status: status_to_string(&l.status.clone().unwrap()),
        sent_at: l.sent_at.clone().unwrap().into(),
    }
}

fn map_event_active_to_domain(e: notification_event::ActiveModel) -> NotificationEvent {
    NotificationEvent {
        id: e.id.clone().unwrap(),
        user_id: e.user_id.clone().unwrap(),
        payload: e.payload.clone().unwrap(),
        event_type: e.r#type.clone().unwrap(),
        scheduled_at: e.scheduled_at.clone().unwrap().into(),
    }
}

fn status_to_string(status: &NotificationLogsTypesEnum) -> String {
    match status {
        NotificationLogsTypesEnum::SENT => "sent".to_string(),
        NotificationLogsTypesEnum::SKIPPED => "skipped".to_string(),
        NotificationLogsTypesEnum::FAILED => "failed".to_string(),
    }
}

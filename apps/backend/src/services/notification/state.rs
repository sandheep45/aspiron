use std::sync::Arc;

use crate::services::notification::service::NotificationService;

#[derive(Clone)]
pub struct NotificationState {
    pub notification_service: NotificationService,
}

impl NotificationState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            notification_service: NotificationService::new(db),
        }
    }
}

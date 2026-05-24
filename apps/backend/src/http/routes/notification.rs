use std::sync::Arc;

use axum::{Router, routing::get, routing::patch};

use crate::application::notification::NotificationApplicationState;
use crate::application::notification::ports::NotificationRepository;
use crate::http::handlers::notification::{handler_get_all, handler_update_status};
use crate::infra::db::repositories::notification_repo::SeaOrmNotificationRepository;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn NotificationRepository> =
        Arc::new(SeaOrmNotificationRepository::new(app_state.db.clone()));
    let notification_state = NotificationApplicationState::new(repo);

    Router::new()
        .route("/notifications", get(handler_get_all))
        .route("/notifications/status", patch(handler_update_status))
        .layer(axum::Extension(notification_state))
}

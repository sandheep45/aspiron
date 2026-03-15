use axum::{
    Router,
    routing::{get, patch},
};

use crate::services::notification::handler::{get_all_notifications, update_notification_status};
use crate::setup::app::AppState;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    Router::new()
        .route("/notifications", get(get_all_notifications))
        .route("/notifications/status", patch(update_notification_status))
}

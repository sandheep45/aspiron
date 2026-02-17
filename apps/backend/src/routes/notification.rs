use axum::{
    Router,
    routing::{get, post},
};

use crate::services::notification::{get_all_notifications, update_notification_status};
use crate::setup::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/notifications", get(get_all_notifications()))
        .route("/notifications/status", post(update_notification_status()))
}

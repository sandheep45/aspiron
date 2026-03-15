use axum::Extension;

use crate::services::notification::state::NotificationState;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/notifications",
    tag = "Notification",
    responses((status = 200, description = "Get all notifications"))
)]
pub async fn get_all_notifications(
    Extension(_state): Extension<NotificationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    patch,
    path = "/api/v1/notifications/status",
    tag = "Notification",
    responses((status = 200, description = "Update notification status"))
)]
pub async fn update_notification_status(
    Extension(_state): Extension<NotificationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

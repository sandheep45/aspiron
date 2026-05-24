use axum::Extension;

use crate::application::notification::NotificationApplicationState;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/notifications",
    tag = "Notification",
    responses((status = 200, description = "Get all notifications"))
)]
pub async fn handler_get_all(
    Extension(_state): Extension<NotificationApplicationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    patch,
    path = "/api/v1/notifications/status",
    tag = "Notification",
    responses((status = 200, description = "Update notification status"))
)]
pub async fn handler_update_status(
    Extension(_state): Extension<NotificationApplicationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

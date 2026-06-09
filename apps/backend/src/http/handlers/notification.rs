use axum::Extension;
use uuid::Uuid;

use crate::application::notification::NotificationApplicationState;
use crate::http::responses::notification::NotificationResponse;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/notifications",
    tag = "Notification",
    responses((status = 200, description = "Get all notifications"))
)]
pub async fn handler_get_all(
    Extension(state): Extension<NotificationApplicationState>,
) -> Result<axum::Json<Vec<NotificationResponse>>, AppError> {
    let user_id = Uuid::default();
    let logs = state.repo.get_notifications_by_user(user_id).await?;
    Ok(axum::Json(
        logs.into_iter()
            .map(|l| NotificationResponse {
                id: l.id,
                user_id: l.event_id,
                title: "Notification".to_string(),
                message: format!("Status: {}", l.status),
                status: l.status,
            })
            .collect(),
    ))
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

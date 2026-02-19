use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/notifications",
    tag = "Notification",
    responses(
        (status = 200, description = "Get all notifications")
    )
)]
pub fn get_all_notifications() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/notifications/status",
    tag = "Notification",
    responses(
        (status = 200, description = "Update notification status")
    )
)]
pub fn update_notification_status() -> Json<bool> {
    Json(true)
}

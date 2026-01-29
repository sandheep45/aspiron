use axum::Json;

pub fn get_all_notifications() -> Json<bool> {
    Json(true)
}

pub fn update_notification_status() -> Json<bool> {
    Json(true)
}

use axum::Json;

pub fn update_progress() -> Json<bool> {
    Json(true)
}

pub fn get_progress_summary() -> Json<bool> {
    Json(true)
}

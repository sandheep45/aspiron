use axum::Json;

#[utoipa::path(
    post,
    path = "/api/v1/progress/update",
    tag = "Learning",
    responses(
        (status = 200, description = "Update progress")
    )
)]
pub fn update_progress() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    delete,
    path = "/api/v1/progress/summary",
    tag = "Learning",
    responses(
        (status = 200, description = "Get progress summary")
    )
)]
pub fn get_progress_summary() -> Json<bool> {
    Json(true)
}

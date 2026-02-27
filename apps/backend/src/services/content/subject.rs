use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/subjects",
    tag = "Content",
    responses(
        (status = 200, description = "Get all subjects")
    )
)]
pub async fn get_all_subjects() -> Json<bool> {
    Json(true)
}

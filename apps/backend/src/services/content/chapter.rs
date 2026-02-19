use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/subjects/{subject_id}/chapters",
    tag = "Content",
    responses(
        (status = 200, description = "Get chapters by subject ID")
    ),
    params(
        ("subject_id" = i64, Path, description = "Subject ID")
    )
)]
pub fn get_chapters_by_subject_id() -> Json<bool> {
    Json(true)
}

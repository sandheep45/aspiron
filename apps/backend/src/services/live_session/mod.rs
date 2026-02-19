use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/live/classes/upcoming",
    tag = "Live Session",
    responses(
        (status = 200, description = "Fetch upcoming live classes")
    )
)]
pub fn fetch_upcomming_live_classes() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/live/classes/{class_id}/join",
    tag = "Live Session",
    responses(
        (status = 200, description = "Join live class by ID")
    ),
    params(
        ("class_id" = i64, Path, description = "Class ID")
    )
)]
pub fn join_live_class_by_id() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/live/classes/{class_id}/recording",
    tag = "Live Session",
    responses(
        (status = 200, description = "Fetch recorded live sessions")
    ),
    params(
        ("class_id" = i64, Path, description = "Class ID")
    )
)]
pub fn fetch_recoreded_live_sessions() -> Json<bool> {
    Json(true)
}

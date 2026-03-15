use axum::Extension;

use crate::services::live_session::state::LiveSessionState;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/live/classes/upcoming",
    tag = "Live Session",
    responses((status = 200, description = "Fetch upcoming live classes"))
)]
pub async fn fetch_upcoming_live_classes(
    Extension(_state): Extension<LiveSessionState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/live/classes/{class_id}/join",
    tag = "Live Session",
    responses((status = 200, description = "Join live class by ID")),
    params(("class_id" = i64, Path, description = "Class ID"))
)]
pub async fn join_live_class_by_id(
    Extension(_state): Extension<LiveSessionState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/live/classes/{class_id}/recording",
    tag = "Live Session",
    responses((status = 200, description = "Fetch recorded live sessions")),
    params(("class_id" = i64, Path, description = "Class ID"))
)]
pub async fn fetch_recorded_live_sessions(
    Extension(_state): Extension<LiveSessionState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

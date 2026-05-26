use axum::{Extension, Json};

use crate::application::live_session::LiveSessionApplicationState;
use crate::domain::live_session::entities::LiveSession;
use crate::http::responses::live_session::LiveClassResponse;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/live/classes/upcoming",
    tag = "Live Session",
    responses((status = 200, description = "Fetch upcoming live classes", body = Vec<LiveClassResponse>))
)]
pub async fn handler_get_upcoming_classes(
    Extension(state): Extension<LiveSessionApplicationState>,
) -> Result<Json<Vec<LiveClassResponse>>, AppError> {
    let sessions = state.repo.get_upcoming_classes().await?;
    let response: Vec<LiveClassResponse> = sessions.into_iter().map(map_to_response).collect();
    Ok(Json(response))
}

fn map_to_response(s: LiveSession) -> LiveClassResponse {
    LiveClassResponse {
        id: s.id,
        topic_id: s.topic_id,
        scheduled_at: s.scheduled_at.into(),
        duration_min: s.duration_min,
        provider: s.provider,
        join_url: s.join_url,
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/live/classes/{class_id}/join",
    tag = "Live Session",
    responses((status = 200, description = "Join live class by ID")),
    params(("class_id" = i64, Path, description = "Class ID"))
)]
pub async fn handler_join_class(
    Extension(_state): Extension<LiveSessionApplicationState>,
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
pub async fn handler_get_recorded_sessions(
    Extension(_state): Extension<LiveSessionApplicationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

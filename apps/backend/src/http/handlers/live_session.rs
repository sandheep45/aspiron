use axum::{Extension, Json, extract::Query};

use crate::application::live_session::LiveSessionApplicationState;
use crate::domain::live_session::entities::LiveSession;
use crate::http::payloads::live_session::LiveClassQueryParams;
use crate::http::responses::common::PaginationResponse;
use crate::http::responses::live_session::{LiveClassResponse, LiveClassesResponse};
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/live/classes/upcoming",
    tag = "Live Session",
    params(LiveClassQueryParams),
    responses((status = 200, description = "Fetch upcoming live classes", body = LiveClassesResponse))
)]
pub async fn handler_get_upcoming_classes(
    Extension(state): Extension<LiveSessionApplicationState>,
    Query(params): Query<LiveClassQueryParams>,
) -> Result<Json<LiveClassesResponse>, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(10).clamp(1, 100);
    let (sessions, total) = state.repo.get_upcoming_classes(page, limit).await?;
    let classes: Vec<LiveClassResponse> = sessions.into_iter().map(map_to_response).collect();
    let total_pages = if total == 0 {
        0
    } else {
        ((total as f64) / limit as f64).ceil() as u32
    };

    Ok(Json(LiveClassesResponse {
        classes,
        pagination: PaginationResponse {
            page,
            limit,
            total,
            filtered_total: total,
            total_pages,
        },
    }))
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

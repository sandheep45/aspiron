use axum::Extension;

use crate::services::community::state::CommunityState;
use crate::setup::error::AppError;

#[utoipa::path(
    post,
    path = "/api/v1/community/threads",
    tag = "Community",
    responses((status = 200, description = "Create a community thread"))
)]
pub async fn create_community_thread(
    Extension(_state): Extension<CommunityState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/topics/{topic_id}/threads",
    tag = "Community",
    responses((status = 200, description = "Fetch community threads per topic")),
    params(("topic_id" = i64, Path, description = "Topic ID"))
)]
pub async fn fetch_community_threads_per_topic(
    Extension(_state): Extension<CommunityState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/{thread_id}",
    tag = "Community",
    responses((status = 200, description = "Fetch community thread by ID")),
    params(("thread_id" = i64, Path, description = "Thread ID"))
)]
pub async fn fetch_community_threads_by_id(
    Extension(_state): Extension<CommunityState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/posts",
    tag = "Community",
    responses((status = 200, description = "Create community posts")),
    params(("thread_id" = i64, Path, description = "Thread ID"))
)]
pub async fn create_community_posts(
    Extension(_state): Extension<CommunityState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/attach-note",
    tag = "Community",
    responses((status = 200, description = "Attach note to thread")),
    params(("thread_id" = i64, Path, description = "Thread ID"))
)]
pub async fn attach_notes_to_thread(
    Extension(_state): Extension<CommunityState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

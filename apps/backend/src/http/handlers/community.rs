use axum::Extension;

use crate::application::community::CommunityApplicationState;
use crate::middleware::auth::AuthUser;
use crate::setup::error::AppError;

#[utoipa::path(
    post,
    path = "/api/v1/community/threads",
    tag = "Community",
    responses((status = 200, description = "Create a community thread"))
)]
pub async fn handler_create_thread(
    Extension(_state): Extension<CommunityApplicationState>,
    Extension(_user): Extension<AuthUser>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/topics/{topic_id}/threads",
    tag = "Community",
    responses((status = 200, description = "Fetch community threads per topic")),
    params(("topic_id" = String, Path, description = "Topic ID"))
)]
pub async fn handler_get_threads_by_topic(
    Extension(_state): Extension<CommunityApplicationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/{thread_id}",
    tag = "Community",
    responses((status = 200, description = "Fetch community thread by ID")),
    params(("thread_id" = String, Path, description = "Thread ID"))
)]
pub async fn handler_get_thread_by_id(
    Extension(_state): Extension<CommunityApplicationState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/posts",
    tag = "Community",
    responses((status = 200, description = "Create community posts")),
    params(("thread_id" = String, Path, description = "Thread ID"))
)]
pub async fn handler_create_post(
    Extension(_state): Extension<CommunityApplicationState>,
    Extension(_user): Extension<AuthUser>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/attach-note",
    tag = "Community",
    responses((status = 200, description = "Attach note to thread")),
    params(("thread_id" = String, Path, description = "Thread ID"))
)]
pub async fn handler_attach_note(
    Extension(_state): Extension<CommunityApplicationState>,
    Extension(_user): Extension<AuthUser>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/public",
    tag = "Community",
    responses(
        (status = 200, description = "Get public threads")
    )
)]
pub async fn handler_public_threads() -> axum::Json<bool> {
    axum::Json(true)
}

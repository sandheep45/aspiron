use axum::extract::Path;
use axum::{Extension, Json};
use uuid::Uuid;

use crate::application::community::CommunityApplicationState;
use crate::http::payloads::community::{AttachNoteRequest, CreatePostRequest, CreateThreadRequest};
use crate::http::responses::community::{PostResponse, ThreadResponse};
use crate::middleware::auth::AuthUser;
use crate::setup::error::AppError;

#[utoipa::path(
    post,
    path = "/api/v1/community/threads",
    tag = "Community",
    responses((status = 200, description = "Create a community thread"))
)]
pub async fn handler_create_thread(
    Extension(state): Extension<CommunityApplicationState>,
    Extension(user): Extension<AuthUser>,
    Json(payload): Json<CreateThreadRequest>,
) -> Result<Json<ThreadResponse>, AppError> {
    let thread = state
        .repo
        .create_thread(user.0, payload.title, payload.content, payload.topic_id)
        .await?;
    Ok(Json(ThreadResponse {
        id: thread.id,
        user_id: thread.user_id,
        title: thread.title,
        topic_id: thread.topic_id,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/topics/{topic_id}/threads",
    tag = "Community",
    responses((status = 200, description = "Fetch community threads per topic")),
    params(("topic_id" = String, Path, description = "Topic ID"))
)]
pub async fn handler_get_threads_by_topic(
    Extension(state): Extension<CommunityApplicationState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<ThreadResponse>>, AppError> {
    let threads = state.repo.get_threads_by_topic(topic_id).await?;
    Ok(Json(
        threads
            .into_iter()
            .map(|t| ThreadResponse {
                id: t.id,
                user_id: t.user_id,
                title: t.title,
                topic_id: t.topic_id,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/{thread_id}",
    tag = "Community",
    responses((status = 200, description = "Fetch community thread by ID")),
    params(("thread_id" = String, Path, description = "Thread ID"))
)]
pub async fn handler_get_thread_by_id(
    Extension(state): Extension<CommunityApplicationState>,
    Path(thread_id): Path<Uuid>,
) -> Result<Json<ThreadResponse>, AppError> {
    let thread = state.repo.get_thread_by_id(thread_id).await?;
    Ok(Json(ThreadResponse {
        id: thread.id,
        user_id: thread.user_id,
        title: thread.title,
        topic_id: thread.topic_id,
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/posts",
    tag = "Community",
    responses((status = 200, description = "Create community posts")),
    params(("thread_id" = String, Path, description = "Thread ID"))
)]
pub async fn handler_create_post(
    Extension(state): Extension<CommunityApplicationState>,
    Extension(user): Extension<AuthUser>,
    Path(thread_id): Path<Uuid>,
    Json(payload): Json<CreatePostRequest>,
) -> Result<Json<PostResponse>, AppError> {
    let post = state
        .repo
        .create_post(user.0, thread_id, payload.content)
        .await?;
    Ok(Json(PostResponse {
        id: post.id,
        thread_id: post.thread_id,
        user_id: post.user_id,
        content: post.content,
    }))
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/attach-note",
    tag = "Community",
    responses((status = 200, description = "Attach note to thread")),
    params(("thread_id" = String, Path, description = "Thread ID"))
)]
pub async fn handler_attach_note(
    Extension(state): Extension<CommunityApplicationState>,
    Extension(_user): Extension<AuthUser>,
    Path(thread_id): Path<Uuid>,
    Json(payload): Json<AttachNoteRequest>,
) -> Result<Json<ThreadResponse>, AppError> {
    let thread = state.repo.attach_note(thread_id, payload.note_id).await?;
    Ok(Json(ThreadResponse {
        id: thread.id,
        user_id: thread.user_id,
        title: thread.title,
        topic_id: thread.topic_id,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/public",
    tag = "Community",
    responses(
        (status = 200, description = "Get public threads")
    )
)]
pub async fn handler_public_threads() -> axum::Json<Vec<ThreadResponse>> {
    axum::Json(vec![])
}

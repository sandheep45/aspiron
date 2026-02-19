use axum::Json;

#[utoipa::path(
    post,
    path = "/api/v1/community/threads",
    tag = "Community",
    responses(
        (status = 200, description = "Create a community thread")
    )
)]
pub fn create_community_thread() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/community/topics/{topic_id}/threads",
    tag = "Community",
    responses(
        (status = 200, description = "Fetch community threads per topic")
    ),
    params(
        ("topic_id" = i64, Path, description = "Topic ID")
    )
)]
pub fn fetch_community_threads_per_topic() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/{thread_id}",
    tag = "Community",
    responses(
        (status = 200, description = "Fetch community thread by ID")
    ),
    params(
        ("thread_id" = i64, Path, description = "Thread ID")
    )
)]
pub fn fetch_community_threads_by_id() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/posts",
    tag = "Community",
    responses(
        (status = 200, description = "Create community posts")
    ),
    params(
        ("thread_id" = i64, Path, description = "Thread ID")
    )
)]
pub fn create_community_posts() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/community/threads/{thread_id}/attach-note",
    tag = "Community",
    responses(
        (status = 200, description = "Attach note to thread")
    ),
    params(
        ("thread_id" = i64, Path, description = "Thread ID")
    )
)]
pub fn attached_notes_to_thread() -> Json<bool> {
    Json(true)
}

use axum::{Router, middleware, routing::get};

use crate::middleware::auth::{PathMatch, register_exempt_paths, require_auth};
use crate::services::community::handler::{
    attach_notes_to_thread, create_community_posts, create_community_thread,
    fetch_community_threads_by_id, fetch_community_threads_per_topic,
};
use crate::setup::app::AppState;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    register_exempt_paths(vec![PathMatch::exact("/community/threads/public")]);

    Router::new()
        .route("/community/threads/public", get(public_threads))
        .route(
            "/community/threads",
            axum::routing::post(create_community_thread),
        )
        .route(
            "/community/topics/{topic_id}/threads",
            get(fetch_community_threads_per_topic),
        )
        .route(
            "/community/threads/{thread_id}",
            get(fetch_community_threads_by_id),
        )
        .route(
            "/community/threads/{thread_id}/posts",
            axum::routing::post(create_community_posts),
        )
        .route(
            "/community/threads/{thread_id}/attach-note",
            axum::routing::post(attach_notes_to_thread),
        )
        .layer(middleware::from_fn(require_auth))
}

#[utoipa::path(
    get,
    path = "/api/v1/community/threads/public",
    tag = "Community",
    responses(
        (status = 200, description = "Get public threads")
    )
)]
pub async fn public_threads() -> axum::Json<bool> {
    axum::Json(true)
}

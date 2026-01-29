use axum::{
    Router,
    routing::{get, post},
};

use crate::services::community::{
    attached_notes_to_thread, create_community_posts, create_community_thread,
    fetch_community_threads_by_id, fetch_community_threads_per_topic,
};

pub fn router() -> Router {
    Router::new()
        .route("/community/threads", post(create_community_thread()))
        .route(
            "/community/topics/{topic_id}/threads",
            get(fetch_community_threads_per_topic()),
        )
        .route(
            "/community/threads/{thread_id}",
            get(fetch_community_threads_by_id()),
        )
        .route(
            "/community/threads/{thread_id}/posts",
            post(create_community_posts()),
        )
        .route(
            "/community/threads/{thread_id}/attach-note",
            post(attached_notes_to_thread()),
        )
}

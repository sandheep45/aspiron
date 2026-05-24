use std::sync::Arc;

use axum::{Router, middleware, routing::get};

use crate::application::community::CommunityApplicationState;
use crate::application::community::ports::CommunityRepository;
use crate::http::handlers::community::{
    handler_attach_note, handler_create_post, handler_create_thread, handler_get_thread_by_id,
    handler_get_threads_by_topic, handler_public_threads,
};
use crate::infra::db::repositories::community_repo::SeaOrmCommunityRepository;
use crate::middleware::auth::{PathMatch, register_exempt_paths, require_auth};
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    register_exempt_paths(vec![PathMatch::exact("/community/threads/public")]);

    let repo: Arc<dyn CommunityRepository> =
        Arc::new(SeaOrmCommunityRepository::new(app_state.db.clone()));
    let community_state = CommunityApplicationState::new(repo);

    Router::new()
        .route("/community/threads/public", get(handler_public_threads))
        .route(
            "/community/threads",
            axum::routing::post(handler_create_thread),
        )
        .route(
            "/community/topics/{topic_id}/threads",
            get(handler_get_threads_by_topic),
        )
        .route(
            "/community/threads/{thread_id}",
            get(handler_get_thread_by_id),
        )
        .route(
            "/community/threads/{thread_id}/posts",
            axum::routing::post(handler_create_post),
        )
        .route(
            "/community/threads/{thread_id}/attach-note",
            axum::routing::post(handler_attach_note),
        )
        .layer(axum::Extension(community_state))
        .layer(middleware::from_fn(require_auth))
}

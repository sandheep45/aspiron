use std::sync::Arc;

use axum::{Router, middleware, routing::get, routing::post};

use crate::application::live_session::LiveSessionApplicationState;
use crate::application::live_session::ports::LiveSessionRepository;
use crate::http::handlers::live_session::{
    handler_get_recorded_sessions, handler_get_upcoming_classes, handler_join_class,
};
use crate::infra::db::repositories::live_session_repo::SeaOrmLiveSessionRepository;
use crate::middleware::auth::require_auth;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn LiveSessionRepository> =
        Arc::new(SeaOrmLiveSessionRepository::new(app_state.db.clone()));
    let live_session_state = LiveSessionApplicationState::new(repo);

    Router::new()
        .route("/live/classes/upcoming", get(handler_get_upcoming_classes))
        .route("/live/classes/{class_id}/join", post(handler_join_class))
        .route(
            "/live/classes/{class_id}/recording",
            get(handler_get_recorded_sessions),
        )
        .layer(axum::Extension(live_session_state))
        .layer(middleware::from_fn(require_auth))
}

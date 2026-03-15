use axum::{
    Router,
    routing::{get, post},
};

use crate::services::live_session::handler::{
    fetch_recorded_live_sessions, fetch_upcoming_live_classes, join_live_class_by_id,
};
use crate::setup::app::AppState;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    Router::new()
        .route(
            "/live/classes/{class_id}/recording",
            get(fetch_recorded_live_sessions),
        )
        .route("/live/classes/{class_id}/join", post(join_live_class_by_id))
        .route("/live/classes/upcoming", get(fetch_upcoming_live_classes))
}

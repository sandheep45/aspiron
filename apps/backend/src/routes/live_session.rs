use axum::{
    Router,
    routing::{get, post},
};

use crate::services::live_session::{
    fetch_recoreded_live_sessions, fetch_upcomming_live_classes, join_live_class_by_id,
};

pub fn router() -> Router {
    Router::new()
        .route(
            "/live/classes/{class_id}/recording",
            get(fetch_recoreded_live_sessions()),
        )
        .route(
            "/live/classes/{class_id}/join",
            post(join_live_class_by_id()),
        )
        .route(
            "/live/classes/upcoming",
            get(fetch_upcomming_live_classes()),
        )
}

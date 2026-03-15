use axum::{
    Router,
    routing::{get, post},
};

use crate::services::assessment::handler::{
    create_attempt, fetch_quiz_by_id, get_quizzes_by_topic_id, get_results_by_attempt_id,
    submit_attempt,
};
use crate::setup::app::AppState;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    Router::new()
        .route("/topics/{topic_id}/quizzes", get(get_quizzes_by_topic_id))
        .route("/quizzes/{quiz_id}", get(fetch_quiz_by_id))
        .route("/attempts", post(create_attempt))
        .route("/attempts/{attempt_id}/submit", post(submit_attempt))
        .route(
            "/attempts/{attempt_id}/results",
            get(get_results_by_attempt_id),
        )
}

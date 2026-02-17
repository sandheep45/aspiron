use axum::{
    Router,
    routing::{get, post},
};

use crate::services::assessment::{
    attempt::{get_results_by_attempt_id, start_attempt_for_a_quiz, submit_attempt_for_a_quiz},
    quiz::{fetch_quiz_by_id, get_quizzes_by_topic_id},
};
use crate::setup::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/topics/{topic_id}/quizzes", get(get_quizzes_by_topic_id()))
        .route("/quizzes/{quiz_id}", get(fetch_quiz_by_id()))
        .route(
            "/quizzes/{quiz_id}/attempts",
            post(start_attempt_for_a_quiz()),
        )
        .route(
            "/attempts/{attempt_id}/submit",
            post(submit_attempt_for_a_quiz()),
        )
        .route(
            "/attempts/{attempt_id}/result",
            get(get_results_by_attempt_id()),
        )
}

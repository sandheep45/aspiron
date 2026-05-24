use std::sync::Arc;

use axum::{
    Router,
    routing::{get, post},
};

use crate::application::assessment::AssessmentApplicationState;
use crate::application::assessment::ports::AssessmentRepository;
use crate::http::handlers::assessment::{
    handler_create_attempt, handler_fetch_quiz_by_id, handler_get_questions_by_quiz_id,
    handler_get_quizzes_by_topic_id, handler_get_results_by_attempt_id, handler_submit_attempt,
};
use crate::infra::db::repositories::assessment_repo::SeaOrmAssessmentRepository;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn AssessmentRepository> =
        Arc::new(SeaOrmAssessmentRepository::new(app_state.db.clone()));
    let assessment_state = AssessmentApplicationState::new(repo);

    Router::new()
        .route(
            "/topics/{topic_id}/quizzes",
            get(handler_get_quizzes_by_topic_id),
        )
        .route("/quizzes/{quiz_id}", get(handler_fetch_quiz_by_id))
        .route(
            "/quizzes/{quiz_id}/questions",
            get(handler_get_questions_by_quiz_id),
        )
        .route("/attempts", post(handler_create_attempt))
        .route(
            "/attempts/{attempt_id}/submit",
            post(handler_submit_attempt),
        )
        .route(
            "/attempts/{attempt_id}/results",
            get(handler_get_results_by_attempt_id),
        )
        .layer(axum::Extension(assessment_state))
}

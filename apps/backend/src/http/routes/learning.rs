use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, patch, post},
};

use crate::application::learning::LearningApplicationState;
use crate::application::learning::ports::LearningRepository;
use crate::http::handlers::learning::{
    handler_create_note, handler_delete_note, handler_get_all_notes, handler_get_progress_summary,
    handler_get_recall_mcq_by_session_id, handler_get_recall_result_by_session_id,
    handler_get_teachers_notes, handler_start_recall, handler_submit_recall_mcq,
    handler_update_note, handler_update_progress,
};
use crate::infra::db::repositories::learning_repo::SeaOrmLearningRepository;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let repo: Arc<dyn LearningRepository> =
        Arc::new(SeaOrmLearningRepository::new(app_state.db.clone()));
    let learning_state = LearningApplicationState::new(repo);

    Router::new()
        .route("/notes", get(handler_get_all_notes))
        .route("/notes", post(handler_create_note))
        .route("/notes/{note_id}", patch(handler_update_note))
        .route("/notes/{note_id}", delete(handler_delete_note))
        .route("/notes/teachers", get(handler_get_teachers_notes))
        .route("/progress/update", post(handler_update_progress))
        .route("/progress/summary", get(handler_get_progress_summary))
        .route("/recall/start", post(handler_start_recall))
        .route(
            "/recall/{session_id}/mcqs",
            get(handler_get_recall_mcq_by_session_id),
        )
        .route(
            "/recall/{session_id}/mcqs/submit",
            post(handler_submit_recall_mcq),
        )
        .route(
            "/recall/{session_id}/result",
            get(handler_get_recall_result_by_session_id),
        )
        .layer(axum::Extension(learning_state))
}

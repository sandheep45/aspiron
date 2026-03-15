use axum::{
    Router,
    routing::{delete, get, patch, post},
};

use crate::services::learning::handler::{
    create_note, delete_note, get_all_notes, get_progress_summary, get_recall_mcq_by_session_id,
    get_recall_result_by_session_id, get_teachers_notes_from_topic_id, start_recall,
    submit_recall_mcq, update_note, update_progress,
};
use crate::setup::app::AppState;

pub fn router(_app_state: &AppState) -> Router<AppState> {
    Router::new()
        .route("/notes", get(get_all_notes))
        .route("/notes", post(create_note))
        .route("/notes/{note_id}", patch(update_note))
        .route("/notes/{note_id}", delete(delete_note))
        .route("/notes/teachers", get(get_teachers_notes_from_topic_id))
        .route("/progress/update", post(update_progress))
        .route("/progress/summary", get(get_progress_summary))
        .route("/recall/start", post(start_recall))
        .route(
            "/recall/{session_id}/mcqs",
            get(get_recall_mcq_by_session_id),
        )
        .route("/recall/{session_id}/mcqs/submit", post(submit_recall_mcq))
        .route(
            "/recall/{session_id}/result",
            get(get_recall_result_by_session_id),
        )
}

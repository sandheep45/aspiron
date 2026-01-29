use axum::{
    Router,
    routing::{delete, get, patch, post},
};

use crate::services::learning::{
    notes::{create_note, delete_note, get_all_notes, update_note},
    progress::{get_progress_summary, update_progress},
    recall::{
        get_recall_mcq_by_session_id, get_recall_result_by_session_id, start_recall,
        submit_recall_mcq,
    },
};

pub fn router() -> Router {
    Router::new()
        .route("/notes", get(get_all_notes()))
        .route("/notes", post(create_note()))
        .route("/notes/{note_id}", patch(update_note()))
        .route("/notes/{note_id}", delete(delete_note()))
        .route("/progress/update", post(update_progress()))
        .route("/progress/summary", delete(get_progress_summary()))
        .route("/recall/start", post(start_recall()))
        .route(
            "/recall/{session_id}/mcqs",
            get(get_recall_mcq_by_session_id()),
        )
        .route(
            "/recall/{session_id}/mcqs/submit",
            post(submit_recall_mcq()),
        )
        .route(
            "/recall/{session_id}/result",
            get(get_recall_result_by_session_id()),
        )
}

use axum::Json;

pub fn start_recall() -> Json<bool> {
    Json(true)
}

pub fn get_recall_mcq_by_session_id() -> Json<bool> {
    Json(true)
}

pub fn submit_recall_mcq() -> Json<bool> {
    Json(true)
}

pub fn get_recall_result_by_session_id() -> Json<bool> {
    Json(true)
}

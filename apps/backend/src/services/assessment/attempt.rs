use axum::Json;

pub fn start_attempt_for_a_quiz() -> Json<bool> {
    Json(true)
}

pub fn submit_attempt_for_a_quiz() -> Json<bool> {
    Json(true)
}

pub fn get_results_by_attempt_id() -> Json<bool> {
    Json(true)
}

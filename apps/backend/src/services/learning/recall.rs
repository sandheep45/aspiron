use axum::Json;

#[utoipa::path(
    post,
    path = "/api/v1/recall/start",
    tag = "Learning",
    responses(
        (status = 200, description = "Start recall session")
    )
)]
pub fn start_recall() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/recall/{session_id}/mcqs",
    tag = "Learning",
    responses(
        (status = 200, description = "Get recall MCQ by session ID")
    ),
    params(
        ("session_id" = i64, Path, description = "Session ID")
    )
)]
pub fn get_recall_mcq_by_session_id() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/recall/{session_id}/mcqs/submit",
    tag = "Learning",
    responses(
        (status = 200, description = "Submit recall MCQ")
    ),
    params(
        ("session_id" = i64, Path, description = "Session ID")
    )
)]
pub fn submit_recall_mcq() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/recall/{session_id}/result",
    tag = "Learning",
    responses(
        (status = 200, description = "Get recall result by session ID")
    ),
    params(
        ("session_id" = i64, Path, description = "Session ID")
    )
)]
pub fn get_recall_result_by_session_id() -> Json<bool> {
    Json(true)
}

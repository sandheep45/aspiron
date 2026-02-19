use axum::Json;

#[utoipa::path(
    post,
    path = "/api/v1/quizzes/{quiz_id}/attempts",
    tag = "Assessment",
    responses(
        (status = 200, description = "Start attempt for a quiz")
    ),
    params(
        ("quiz_id" = i64, Path, description = "Quiz ID")
    )
)]
pub fn start_attempt_for_a_quiz() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/attempts/{attempt_id}/submit",
    tag = "Assessment",
    responses(
        (status = 200, description = "Submit attempt for a quiz")
    ),
    params(
        ("attempt_id" = i64, Path, description = "Attempt ID")
    )
)]
pub fn submit_attempt_for_a_quiz() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/attempts/{attempt_id}/result",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get results by attempt ID")
    ),
    params(
        ("attempt_id" = i64, Path, description = "Attempt ID")
    )
)]
pub fn get_results_by_attempt_id() -> Json<bool> {
    Json(true)
}

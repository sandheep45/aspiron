use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/quizzes",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get quizzes by topic ID")
    ),
    params(
        ("topic_id" = i64, Path, description = "Topic ID")
    )
)]
pub fn get_quizzes_by_topic_id() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/quizzes/{quiz_id}",
    tag = "Assessment",
    responses(
        (status = 200, description = "Get quiz by ID")
    ),
    params(
        ("quiz_id" = i64, Path, description = "Quiz ID")
    )
)]
pub fn fetch_quiz_by_id() -> Json<bool> {
    Json(true)
}

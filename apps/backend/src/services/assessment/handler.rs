use axum::Extension;

use crate::services::assessment::state::AssessmentState;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/quizzes",
    tag = "Assessment",
    responses((status = 200, description = "Get quizzes by topic ID")),
    params(("topic_id" = i64, Path, description = "Topic ID"))
)]
pub async fn get_quizzes_by_topic_id(
    Extension(_state): Extension<AssessmentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/quizzes/{quiz_id}",
    tag = "Assessment",
    responses((status = 200, description = "Get quiz by ID")),
    params(("quiz_id" = i64, Path, description = "Quiz ID"))
)]
pub async fn fetch_quiz_by_id(
    Extension(_state): Extension<AssessmentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/quizzes/{quiz_id}/questions",
    tag = "Assessment",
    responses((status = 200, description = "Get questions by quiz ID")),
    params(("quiz_id" = i64, Path, description = "Quiz ID"))
)]
pub async fn get_questions_by_quiz_id(
    Extension(_state): Extension<AssessmentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/attempts",
    tag = "Assessment",
    responses((status = 200, description = "Create assessment attempt"))
)]
pub async fn create_attempt(
    Extension(_state): Extension<AssessmentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    post,
    path = "/api/v1/attempts/{attempt_id}/submit",
    tag = "Assessment",
    responses((status = 200, description = "Submit assessment attempt")),
    params(("attempt_id" = i64, Path, description = "Attempt ID"))
)]
pub async fn submit_attempt(
    Extension(_state): Extension<AssessmentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/attempts/{attempt_id}/results",
    tag = "Assessment",
    responses((status = 200, description = "Get attempt results")),
    params(("attempt_id" = i64, Path, description = "Attempt ID"))
)]
pub async fn get_results_by_attempt_id(
    Extension(_state): Extension<AssessmentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

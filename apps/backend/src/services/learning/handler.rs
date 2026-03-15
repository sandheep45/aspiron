use axum::Extension;

use crate::services::learning::state::LearningState;
use crate::setup::error::AppError;

pub async fn get_all_notes(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn create_note(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn update_note(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn delete_note(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn get_teachers_notes_from_topic_id(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn update_progress(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn get_progress_summary(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn start_recall(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn get_recall_mcq_by_session_id(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn submit_recall_mcq(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

pub async fn get_recall_result_by_session_id(
    Extension(_state): Extension<LearningState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

use axum::extract::Path;
use axum::{Extension, Json};
use uuid::Uuid;

use crate::entries::dtos::response::content::TopicDto;
use crate::services::content::state::ContentState;
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/subjects",
    tag = "Content",
    responses((status = 200, description = "Get all subjects"))
)]
pub async fn get_all_subjects(
    Extension(_state): Extension<ContentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/subjects/{subject_id}/chapters",
    tag = "Content",
    responses((status = 200, description = "Get chapters by subject ID")),
    params(("subject_id" = i64, Path, description = "Subject ID"))
)]
pub async fn get_chapters_by_subject_id(
    Extension(_state): Extension<ContentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/chapters/{chapter_id}/topics",
    tag = "Content",
    responses((status = 200, description = "Get topics by chapter ID")),
    params(("chapter_id" = i64, Path, description = "Chapter ID"))
)]
pub async fn get_topics_by_chapter_id(
    Extension(_state): Extension<ContentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}",
    tag = "Content",
    responses(
        (status = 200, description = "Get topic metadata by topic ID")
    ),
    params(
        ("topic_id" = i64, Path, description = "Topic ID")
    )
)]
pub async fn get_topic_by_id(
    Path(topic_id): Path<Uuid>,
    Extension(state): Extension<ContentState>,
) -> Result<Json<TopicDto>, AppError> {
    let topic_data = state.topic_service.get_topic_by_id(topic_id).await?;
    Ok(Json(topic_data))
}

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/videos",
    tag = "Content",
    responses((status = 200, description = "Get videos by topic ID")),
    params(("topic_id" = i64, Path, description = "Topic ID"))
)]
pub async fn get_videos_by_topic_id(
    Extension(_state): Extension<ContentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

#[utoipa::path(
    get,
    path = "/api/v1/videos/{video_id}/offline-token",
    tag = "Content",
    responses((status = 200, description = "Get offline token by video ID")),
    params(("video_id" = i64, Path, description = "Video ID"))
)]
pub async fn get_offline_token_by_video_id(
    Extension(_state): Extension<ContentState>,
) -> Result<axum::Json<bool>, AppError> {
    Ok(axum::Json(true))
}

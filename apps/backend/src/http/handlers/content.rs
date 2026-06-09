use axum::extract::Path;
use axum::{Extension, Json};
use uuid::Uuid;

use crate::application::content::{
    ContentApplicationState, get_chapters, get_offline_token, get_subjects, get_topic, get_topics,
    get_videos,
};
use crate::http::responses::content::{
    ChapterResponse, OfflineTokenResponse, SubjectResponse, TopicResponse, VideoResponse,
};
use crate::setup::error::AppError;

#[utoipa::path(
    get,
    path = "/api/v1/subjects",
    tag = "Content",
    responses((status = 200, description = "Get all subjects"))
)]
pub async fn handler_get_all_subjects(
    Extension(state): Extension<ContentApplicationState>,
) -> Result<Json<Vec<SubjectResponse>>, AppError> {
    let subjects = get_subjects::execute_get_subjects(&*state.repo).await?;
    Ok(Json(
        subjects
            .into_iter()
            .map(|s| SubjectResponse {
                id: s.id,
                name: s.name,
                description: None,
                icon_url: None,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/subjects/{subject_id}/chapters",
    tag = "Content",
    responses((status = 200, description = "Get chapters by subject ID")),
    params(("subject_id" = String, Path, description = "Subject ID"))
)]
pub async fn handler_get_chapters_by_subject_id(
    Extension(state): Extension<ContentApplicationState>,
    Path(subject_id): Path<Uuid>,
) -> Result<Json<Vec<ChapterResponse>>, AppError> {
    let chapters = get_chapters::execute_get_chapters(&*state.repo, subject_id).await?;
    Ok(Json(
        chapters
            .into_iter()
            .map(|c| ChapterResponse {
                id: c.id,
                name: c.name,
                subject_id: c.subject_id,
                order_number: c.order_number,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/chapters/{chapter_id}/topics",
    tag = "Content",
    responses((status = 200, description = "Get topics by chapter ID")),
    params(("chapter_id" = String, Path, description = "Chapter ID"))
)]
pub async fn handler_get_topics_by_chapter_id(
    Extension(state): Extension<ContentApplicationState>,
    Path(chapter_id): Path<Uuid>,
) -> Result<Json<Vec<TopicResponse>>, AppError> {
    let topics = get_topics::execute_get_topics(&*state.repo, chapter_id).await?;
    let chapter = state.repo.get_chapter_by_id(chapter_id).await?;
    let subject = state.repo.get_subject_by_id(chapter.subject_id).await?;
    let subject_id = chapter.subject_id;
    Ok(Json(
        topics
            .into_iter()
            .map(|t| TopicResponse {
                id: t.id,
                name: t.name,
                chapter_id: t.chapter_id,
                order_number: t.order_number,
                subject_id,
                chapter_name: chapter.name.clone(),
                subject_name: subject.name.clone(),
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}",
    tag = "Content",
    responses(
        (status = 200, description = "Get topic metadata by topic ID")
    ),
    params(
        ("topic_id" = String, Path, description = "Topic ID")
    )
)]
pub async fn handler_get_topic_by_id(
    Path(topic_id): Path<Uuid>,
    Extension(state): Extension<ContentApplicationState>,
) -> Result<Json<TopicResponse>, AppError> {
    let topic = get_topic::execute_get_topic(&*state.repo, topic_id).await?;
    let chapter = state.repo.get_chapter_by_id(topic.chapter_id).await?;
    let subject = state.repo.get_subject_by_id(chapter.subject_id).await?;
    Ok(Json(TopicResponse {
        id: topic.id,
        name: topic.name,
        chapter_id: topic.chapter_id,
        order_number: topic.order_number,
        subject_id: chapter.subject_id,
        chapter_name: chapter.name,
        subject_name: subject.name,
    }))
}

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/videos",
    tag = "Content",
    responses((status = 200, description = "Get videos by topic ID")),
    params(("topic_id" = String, Path, description = "Topic ID"))
)]
pub async fn handler_get_videos_by_topic_id(
    Extension(state): Extension<ContentApplicationState>,
    Path(topic_id): Path<Uuid>,
) -> Result<Json<Vec<VideoResponse>>, AppError> {
    let videos = get_videos::execute_get_videos(&*state.repo, topic_id).await?;
    Ok(Json(
        videos
            .into_iter()
            .map(|v| VideoResponse {
                id: v.id,
                topic_id: v.topic_id,
                title: v.title,
                duration_seconds: v.duration_seconds,
                video_url: v.video_url,
                transcript: v.transcript,
            })
            .collect(),
    ))
}

#[utoipa::path(
    get,
    path = "/api/v1/videos/{video_id}/offline-token",
    tag = "Content",
    responses((status = 200, description = "Get offline token by video ID")),
    params(("video_id" = String, Path, description = "Video ID"))
)]
pub async fn handler_get_offline_token_by_video_id(
    Extension(state): Extension<ContentApplicationState>,
    Path(video_id): Path<Uuid>,
) -> Result<Json<OfflineTokenResponse>, AppError> {
    let token = get_offline_token::execute_get_offline_token(&*state.repo, video_id).await?;
    Ok(Json(OfflineTokenResponse {
        offline_token: token.token,
        expires_at: token.expires_at.to_rfc3339(),
    }))
}

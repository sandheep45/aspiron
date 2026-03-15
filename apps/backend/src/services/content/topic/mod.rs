use axum::Json;

use crate::services::content::topic::service::TopicService;

pub mod repository;
pub mod service;

#[derive(Clone)]
pub struct ContentState {
    pub topic_service: TopicService,
}

#[utoipa::path(
    get,
    path = "/api/v1/chapters/{chapter_id}/topics",
    tag = "Content",
    responses(
        (status = 200, description = "Get topics by chapter ID")
    ),
    params(
        ("chapter_id" = i64, Path, description = "Chapter ID")
    )
)]
pub async fn get_topics_by_chapter_id() -> Json<bool> {
    Json(true)
}

use axum::Json;

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
pub fn get_topics_by_chapter_id() -> Json<bool> {
    Json(true)
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
pub fn get_topics_metadata_by_topic_id() -> Json<bool> {
    Json(true)
}

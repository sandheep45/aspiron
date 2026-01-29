use axum::Json;

pub fn get_topics_by_chapter_id() -> Json<bool> {
    Json(true)
}

pub fn get_topics_metadata_by_topic_id() -> Json<bool> {
    Json(true)
}

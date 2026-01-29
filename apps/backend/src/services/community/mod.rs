use axum::Json;

pub fn create_community_thread() -> Json<bool> {
    Json(true)
}

pub fn fetch_community_threads_per_topic() -> Json<bool> {
    Json(true)
}

pub fn fetch_community_threads_by_id() -> Json<bool> {
    Json(true)
}

pub fn create_community_posts() -> Json<bool> {
    Json(true)
}

pub fn attached_notes_to_thread() -> Json<bool> {
    Json(true)
}

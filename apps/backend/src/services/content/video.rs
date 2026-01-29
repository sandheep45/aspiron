use axum::Json;

pub fn get_videos_by_topic_id() -> Json<bool> {
    Json(true)
}

pub fn generate_playback_token_by_video_id() -> Json<bool> {
    Json(true)
}

pub fn get_offline_token_by_video_id() -> Json<bool> {
    Json(false)
}

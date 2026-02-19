use axum::Json;

#[utoipa::path(
    get,
    path = "/api/v1/topics/{topic_id}/videos",
    tag = "Content",
    responses(
        (status = 200, description = "Get videos by topic ID")
    ),
    params(
        ("topic_id" = i64, Path, description = "Topic ID")
    )
)]
pub fn get_videos_by_topic_id() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/videos/{video_id}/playback-token",
    tag = "Content",
    responses(
        (status = 200, description = "Generate playback token by video ID")
    ),
    params(
        ("video_id" = i64, Path, description = "Video ID")
    )
)]
pub fn generate_playback_token_by_video_id() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    get,
    path = "/api/v1/videos/{video_id}/offline-token",
    tag = "Content",
    responses(
        (status = 200, description = "Get offline token by video ID")
    ),
    params(
        ("video_id" = i64, Path, description = "Video ID")
    )
)]
pub fn get_offline_token_by_video_id() -> Json<bool> {
    Json(false)
}

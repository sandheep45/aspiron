use axum::{Extension, Router, routing::get};

use crate::services::content::handler::{
    get_all_subjects, get_chapters_by_subject_id, get_offline_token_by_video_id, get_topic_by_id,
    get_topics_by_chapter_id, get_videos_by_topic_id,
};
use crate::services::content::state::ContentState;
use crate::services::learning::handler::get_teachers_notes_from_topic_id;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let state = ContentState::new(app_state.db.clone());
    Router::new()
        .route("/subjects", get(get_all_subjects))
        .route(
            "/subjects/{subject_id}/chapters",
            get(get_chapters_by_subject_id),
        )
        .route(
            "/chapters/{chapter_id}/topics",
            get(get_topics_by_chapter_id),
        )
        .route("/topics/{topic_id}", get(get_topic_by_id))
        .route("/topics/{topic_id}/videos", get(get_videos_by_topic_id))
        .route(
            "/topics/{topic_id}/notes/official",
            get(get_teachers_notes_from_topic_id),
        )
        .route(
            "/videos/{video_id}/offline-token",
            get(get_offline_token_by_video_id),
        )
        .layer(Extension(state))
}

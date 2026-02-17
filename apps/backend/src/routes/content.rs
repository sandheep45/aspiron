use axum::{Router, routing::get};

use crate::services::{
    content::{
        chapter::get_chapters_by_subject_id,
        subject::get_all_subjects,
        topic::{get_topics_by_chapter_id, get_topics_metadata_by_topic_id},
        video::{
            generate_playback_token_by_video_id, get_offline_token_by_video_id,
            get_videos_by_topic_id,
        },
    },
    learning::notes::get_teachers_notes_from_topic_id,
};
use crate::setup::app::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/subjects", get(get_all_subjects()))
        .route(
            "/subjects/{subject_id}/chapters",
            get(get_chapters_by_subject_id()),
        )
        .route(
            "/chapters/{chapter_id}/topics",
            get(get_topics_by_chapter_id()),
        )
        .route("/topics/{topic_id}", get(get_topics_metadata_by_topic_id()))
        .route("/topics/{topic_id}/videos", get(get_videos_by_topic_id()))
        .route(
            "/topics/{topic_id}/notes/official",
            get(get_teachers_notes_from_topic_id()),
        )
        .route(
            "/videos/{video_id}/offline-token",
            get(get_offline_token_by_video_id()),
        )
        .route(
            "/videos/{video_id}/playback-token",
            get(generate_playback_token_by_video_id()),
        )
}

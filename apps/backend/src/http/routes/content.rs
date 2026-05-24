use std::sync::Arc;

use axum::{Router, routing::get};

use crate::application::content::ContentApplicationState;
use crate::application::content::ports::ContentRepository;
use crate::application::learning::LearningApplicationState;
use crate::application::learning::ports::LearningRepository;
use crate::http::handlers::content::{
    handler_get_all_subjects, handler_get_chapters_by_subject_id,
    handler_get_offline_token_by_video_id, handler_get_topic_by_id,
    handler_get_topics_by_chapter_id, handler_get_videos_by_topic_id,
};
use crate::http::handlers::learning::handler_get_teachers_notes;
use crate::infra::db::repositories::content_repo::SeaOrmContentRepository;
use crate::infra::db::repositories::learning_repo::SeaOrmLearningRepository;
use crate::setup::app::AppState;

pub fn router(app_state: &AppState) -> Router<AppState> {
    let content_repo: Arc<dyn ContentRepository> =
        Arc::new(SeaOrmContentRepository::new(app_state.db.clone()));
    let content_state = ContentApplicationState::new(content_repo);

    let learning_repo: Arc<dyn LearningRepository> =
        Arc::new(SeaOrmLearningRepository::new(app_state.db.clone()));
    let learning_state = LearningApplicationState::new(learning_repo);

    Router::new()
        .route("/subjects", get(handler_get_all_subjects))
        .route(
            "/subjects/{subject_id}/chapters",
            get(handler_get_chapters_by_subject_id),
        )
        .route(
            "/chapters/{chapter_id}/topics",
            get(handler_get_topics_by_chapter_id),
        )
        .route("/topics/{topic_id}", get(handler_get_topic_by_id))
        .route(
            "/topics/{topic_id}/videos",
            get(handler_get_videos_by_topic_id),
        )
        .route(
            "/topics/{topic_id}/notes/official",
            get(handler_get_teachers_notes),
        )
        .route(
            "/videos/{video_id}/offline-token",
            get(handler_get_offline_token_by_video_id),
        )
        .layer(axum::Extension(content_state))
        .layer(axum::Extension(learning_state))
}

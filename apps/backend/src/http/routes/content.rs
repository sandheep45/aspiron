use std::sync::Arc;

use axum::{
    Router,
    routing::{delete, get, post},
};

use crate::application::content::ContentApplicationState;
use crate::application::content::ports::ContentRepository;
use crate::application::learning::LearningApplicationState;
use crate::application::learning::ports::LearningRepository;
use crate::http::handlers::chapters_page::{
    handler_get_chapters_page_chapters, handler_get_chapters_page_insights,
    handler_get_chapters_page_summary,
};
use crate::http::handlers::content::{
    handler_get_all_subjects, handler_get_chapters_by_subject_id,
    handler_get_offline_token_by_video_id, handler_get_topic_by_id,
    handler_get_topics_by_chapter_id, handler_get_videos_by_topic_id,
};
use crate::http::handlers::content_dashboard::{
    handler_get_content_dashboard_attention, handler_get_content_dashboard_signals,
    handler_get_content_dashboard_subjects, handler_get_content_dashboard_summary,
};
use crate::http::handlers::learning::handler_get_teachers_notes;
use crate::http::handlers::notes_manager::{
    handler_approve_ai_notes, handler_create_reference, handler_delete_reference,
    handler_get_ai_notes, handler_get_notes_overview, handler_get_references,
    handler_get_teacher_notes, handler_publish_teacher_notes, handler_toggle_reference_visibility,
    handler_unpublish_teacher_notes, handler_update_teacher_note,
};
use crate::http::handlers::practice_tests::{
    handler_create_question, handler_create_test, handler_get_practice_overview,
    handler_get_practice_signals, handler_get_questions, handler_get_test_analytics,
    handler_get_topic_tests,
};
use crate::http::handlers::recall_insights::{
    handler_get_free_recall, handler_get_mcq_recall, handler_get_memory_gaps,
    handler_get_recall_actions, handler_get_recall_overview, handler_get_recall_trends,
};
use crate::http::handlers::subjects_page::{
    handler_get_subjects_page, handler_get_subjects_page_signals, handler_get_subjects_page_summary,
};
use crate::http::handlers::topic_detail::{
    handler_get_topic_actions, handler_get_topic_components, handler_get_topic_issues,
    handler_get_topic_overview, handler_get_topic_trends,
};
use crate::http::handlers::topics_page::{
    handler_get_topics_page_insights, handler_get_topics_page_summary,
    handler_get_topics_page_topics,
};
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
            "/topics/{topic_id}/overview",
            get(handler_get_topic_overview),
        )
        .route("/topics/{topic_id}/issues", get(handler_get_topic_issues))
        .route(
            "/topics/{topic_id}/components",
            get(handler_get_topic_components),
        )
        .route("/topics/{topic_id}/actions", get(handler_get_topic_actions))
        .route("/topics/{topic_id}/trends", get(handler_get_topic_trends))
        .route(
            "/topics/{topic_id}/practice/overview",
            get(handler_get_practice_overview),
        )
        .route(
            "/topics/{topic_id}/practice/questions",
            get(handler_get_questions).post(handler_create_question),
        )
        .route(
            "/topics/{topic_id}/practice/tests",
            get(handler_get_topic_tests).post(handler_create_test),
        )
        .route(
            "/topics/{topic_id}/practice/signals",
            get(handler_get_practice_signals),
        )
        .route(
            "/topics/{topic_id}/practice/analytics",
            get(handler_get_test_analytics),
        )
        .route(
            "/topics/{topic_id}/recall/overview",
            get(handler_get_recall_overview),
        )
        .route("/topics/{topic_id}/recall/mcq", get(handler_get_mcq_recall))
        .route(
            "/topics/{topic_id}/recall/free-response",
            get(handler_get_free_recall),
        )
        .route(
            "/topics/{topic_id}/recall/gaps",
            get(handler_get_memory_gaps),
        )
        .route(
            "/topics/{topic_id}/recall/actions",
            get(handler_get_recall_actions),
        )
        .route(
            "/topics/{topic_id}/recall/trends",
            get(handler_get_recall_trends),
        )
        .route(
            "/videos/{video_id}/offline-token",
            get(handler_get_offline_token_by_video_id),
        )
        .route(
            "/content/dashboard/summary",
            get(handler_get_content_dashboard_summary),
        )
        .route(
            "/content/dashboard/attention",
            get(handler_get_content_dashboard_attention),
        )
        .route(
            "/content/dashboard/subjects",
            get(handler_get_content_dashboard_subjects),
        )
        .route(
            "/content/dashboard/signals",
            get(handler_get_content_dashboard_signals),
        )
        .route("/content/subjects-page", get(handler_get_subjects_page))
        .route(
            "/content/subjects-page/summary",
            get(handler_get_subjects_page_summary),
        )
        .route(
            "/content/subjects-page/signals",
            get(handler_get_subjects_page_signals),
        )
        .route(
            "/subjects/{subject_id}/chapters-page/summary",
            get(handler_get_chapters_page_summary),
        )
        .route(
            "/subjects/{subject_id}/chapters-page/chapters",
            get(handler_get_chapters_page_chapters),
        )
        .route(
            "/subjects/{subject_id}/chapters-page/insights",
            get(handler_get_chapters_page_insights),
        )
        .route(
            "/chapters/{chapter_id}/topics-page/summary",
            get(handler_get_topics_page_summary),
        )
        .route(
            "/chapters/{chapter_id}/topics-page/topics",
            get(handler_get_topics_page_topics),
        )
        .route(
            "/chapters/{chapter_id}/topics-page/insights",
            get(handler_get_topics_page_insights),
        )
        .route(
            "/topics/{topic_id}/notes/overview",
            get(handler_get_notes_overview),
        )
        .route(
            "/topics/{topic_id}/notes",
            get(handler_get_teacher_notes).put(handler_update_teacher_note),
        )
        .route(
            "/topics/{topic_id}/notes/publish",
            post(handler_publish_teacher_notes),
        )
        .route(
            "/topics/{topic_id}/notes/unpublish",
            post(handler_unpublish_teacher_notes),
        )
        .route("/topics/{topic_id}/ai-notes", get(handler_get_ai_notes))
        .route(
            "/topics/{topic_id}/ai-notes/{note_id}/approve",
            post(handler_approve_ai_notes),
        )
        .route(
            "/topics/{topic_id}/references",
            get(handler_get_references).post(handler_create_reference),
        )
        .route(
            "/topics/{topic_id}/references/{reference_id}",
            delete(handler_delete_reference),
        )
        .route(
            "/topics/{topic_id}/references/{reference_id}/toggle",
            post(handler_toggle_reference_visibility),
        )
        .layer(axum::Extension(content_state))
        .layer(axum::Extension(learning_state))
}

use axum::{Json, response::IntoResponse};
use utoipa::OpenApi;

use crate::routes;
use crate::services;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Aspiron API",
        version = "0.1.0",
        description = "Backend API for the Aspiron project"
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server")
    ),
    paths(
        routes::health::health,
        services::auth::authenticate_user,
        services::auth::refresh_token,
        services::auth::register_user,
        services::auth::get_me,
        services::assessment::quiz::get_quizzes_by_topic_id,
        services::assessment::quiz::fetch_quiz_by_id,
        services::assessment::attempt::start_attempt_for_a_quiz,
        services::assessment::attempt::submit_attempt_for_a_quiz,
        services::assessment::attempt::get_results_by_attempt_id,
        services::community::create_community_thread,
        services::community::fetch_community_threads_per_topic,
        services::community::fetch_community_threads_by_id,
        services::community::create_community_posts,
        services::community::attached_notes_to_thread,
        services::content::subject::get_all_subjects,
        services::content::chapter::get_chapters_by_subject_id,
        services::content::topic::get_topics_by_chapter_id,
        services::content::topic::get_topics_metadata_by_topic_id,
        services::content::video::get_videos_by_topic_id,
        services::learning::notes::get_teachers_notes_from_topic_id,
        services::content::video::get_offline_token_by_video_id,
        services::content::video::generate_playback_token_by_video_id,
        services::learning::notes::get_all_notes,
        services::learning::notes::create_note,
        services::learning::notes::update_note,
        services::learning::notes::delete_note,
        services::learning::progress::update_progress,
        services::learning::progress::get_progress_summary,
        services::learning::recall::start_recall,
        services::learning::recall::get_recall_mcq_by_session_id,
        services::learning::recall::submit_recall_mcq,
        services::learning::recall::get_recall_result_by_session_id,
        services::live_session::fetch_recoreded_live_sessions,
        services::live_session::join_live_class_by_id,
        services::live_session::fetch_upcomming_live_classes,
        services::notification::get_all_notifications,
        services::notification::update_notification_status
    )
)]
pub struct ApiDoc;

pub async fn openapi_json() -> impl IntoResponse {
    Json(ApiDoc::openapi())
}

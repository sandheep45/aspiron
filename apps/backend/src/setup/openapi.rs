use axum::{Json, response::IntoResponse};
use utoipa::{Modify, OpenApi};

use crate::routes;
use crate::services;
use crate::setup::config::Config;

struct AddXClientTypeHeader;

impl Modify for AddXClientTypeHeader {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let header = utoipa::openapi::path::Parameter::builder()
            .name("x-client-type")
            .parameter_in(utoipa::openapi::path::ParameterIn::Header)
            .description(Some("Client type header".to_string()))
            .example(Some(serde_json::json!("BROWSER")))
            .build();

        for path_item in openapi.paths.paths.values_mut() {
            let mut params = path_item.parameters.clone().unwrap_or_default();
            params.push(header.clone());
            path_item.parameters = Some(params);
        }
    }
}

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Aspiron API",
        version = "0.1.0",
        description = "Backend API for the Aspiron project"
    ),
    modifiers(&AddXClientTypeHeader),
    paths(
        routes::health::health,
        services::auth::authenticate_user,
        services::auth::refresh_token,
        services::auth::register_user,
        services::auth::get_me,
        services::assessment::handler::get_quizzes_by_topic_id,
        services::assessment::handler::fetch_quiz_by_id,
        services::assessment::handler::create_attempt,
        services::assessment::handler::submit_attempt,
        services::assessment::handler::get_results_by_attempt_id,
        services::community::handler::create_community_thread,
        services::community::handler::fetch_community_threads_per_topic,
        services::community::handler::fetch_community_threads_by_id,
        services::community::handler::create_community_posts,
        services::community::handler::attach_notes_to_thread,
        services::content::handler::get_all_subjects,
        services::content::handler::get_chapters_by_subject_id,
        services::content::handler::get_topics_by_chapter_id,
        services::content::handler::get_topic_by_id,
        services::content::handler::get_videos_by_topic_id,
        services::content::handler::get_offline_token_by_video_id,
        services::learning::notes::get_teachers_notes_from_topic_id,
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
        services::live_session::handler::fetch_recorded_live_sessions,
        services::live_session::handler::join_live_class_by_id,
        services::live_session::handler::fetch_upcoming_live_classes,
        services::notification::handler::get_all_notifications,
        services::notification::handler::update_notification_status
    )
)]
pub struct ApiDoc;

pub async fn openapi_json() -> impl IntoResponse {
    let config = Config::from_env();
    let server_url = format!("http://{}:{}", config.app.host, config.app.port);

    let mut openapi = ApiDoc::openapi();

    let server = utoipa::openapi::Server::new(server_url);

    openapi.servers = Some(vec![server]);

    Json(openapi)
}

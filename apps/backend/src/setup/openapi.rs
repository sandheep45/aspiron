use axum::{Json, response::IntoResponse};
use utoipa::{Modify, OpenApi};

use crate::http::routes;
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
        crate::http::handlers::community::handler_public_threads,
        crate::http::handlers::auth::authenticate_user,
        crate::http::handlers::auth::refresh_token_handler,
        crate::http::handlers::auth::register_user,
        crate::http::handlers::auth::log_out,
        crate::http::handlers::auth::get_me,
        crate::http::handlers::users::handler_get_user_by_email,
        crate::http::handlers::assessment::handler_get_quizzes_by_topic_id,
        crate::http::handlers::assessment::handler_fetch_quiz_by_id,
        crate::http::handlers::assessment::handler_get_questions_by_quiz_id,
        crate::http::handlers::assessment::handler_create_attempt,
        crate::http::handlers::assessment::handler_submit_attempt,
        crate::http::handlers::assessment::handler_get_results_by_attempt_id,
        crate::http::handlers::community::handler_create_thread,
        crate::http::handlers::community::handler_get_threads_by_topic,
        crate::http::handlers::community::handler_get_thread_by_id,
        crate::http::handlers::community::handler_create_post,
        crate::http::handlers::community::handler_attach_note,
        crate::http::handlers::content::handler_get_all_subjects,
        crate::http::handlers::content::handler_get_chapters_by_subject_id,
        crate::http::handlers::content::handler_get_topics_by_chapter_id,
        crate::http::handlers::content::handler_get_topic_by_id,
        crate::http::handlers::content::handler_get_videos_by_topic_id,
        crate::http::handlers::content::handler_get_offline_token_by_video_id,
        crate::http::handlers::learning::handler_get_teachers_notes,
        crate::http::handlers::learning::handler_get_all_notes,
        crate::http::handlers::learning::handler_create_note,
        crate::http::handlers::learning::handler_update_note,
        crate::http::handlers::learning::handler_delete_note,
        crate::http::handlers::learning::handler_update_progress,
        crate::http::handlers::learning::handler_get_progress_summary,
        crate::http::handlers::learning::handler_start_recall,
        crate::http::handlers::learning::handler_get_recall_mcq_by_session_id,
        crate::http::handlers::learning::handler_submit_recall_mcq,
        crate::http::handlers::learning::handler_get_recall_result_by_session_id,
        crate::http::handlers::live_session::handler_get_recorded_sessions,
        crate::http::handlers::live_session::handler_join_class,
        crate::http::handlers::live_session::handler_get_upcoming_classes,
        crate::http::handlers::notification::handler_get_all,
        crate::http::handlers::notification::handler_update_status,
        crate::http::handlers::insights::handler_get_insights,
        crate::http::handlers::insights::handler_get_topic_performance,
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

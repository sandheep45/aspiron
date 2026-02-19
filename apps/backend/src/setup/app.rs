use axum::http::header::{AUTHORIZATION, CONTENT_TYPE};
use axum::http::{HeaderName, HeaderValue, Method};
use axum::middleware;
use axum::routing::get;
use std::sync::{Arc, LazyLock, RwLock};

use crate::middleware::auth::authenticate;
use crate::{
    routes::api_v1_router,
    setup::{config::Config, openapi},
};
use sea_orm::DatabaseConnection;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

pub static ROUTE_REGISTRY: LazyLock<RwLock<RouteRegistry>> =
    LazyLock::new(|| RwLock::new(RouteRegistry::new()));

#[derive(Default, Clone)]
pub struct RouteRegistry {
    routes: Vec<RouteInfo>,
}

impl RouteRegistry {
    fn new() -> Self {
        Self::default()
    }

    pub fn register(&mut self, method: &str, path: &str) {
        self.routes.push(RouteInfo {
            method: method.to_string(),
            path: path.to_string(),
        });
    }

    pub fn routes(&self) -> Vec<RouteInfo> {
        self.routes.clone()
    }

    pub fn print(&self) {
        let routes = &self.routes;
        if routes.is_empty() {
            tracing::info!("No routes registered");
            return;
        }

        let max_method_len = routes.iter().map(|r| r.method.len()).max().unwrap_or(6);
        let max_path_len = routes.iter().map(|r| r.path.len()).max().unwrap_or(4);

        tracing::info!("");
        tracing::info!("{}", "═".repeat(max_method_len + max_path_len + 7));
        tracing::info!(
            "{:^width$}",
            "Available Routes",
            width = max_method_len + max_path_len + 1
        );
        tracing::info!("{}", "═".repeat(max_method_len + max_path_len + 7));

        for route in routes {
            tracing::info!(
                "  {:<method_width$} {}",
                route.method,
                route.path,
                method_width = max_method_len
            );
        }

        tracing::info!("{}", "═".repeat(max_method_len + max_path_len + 7));
        tracing::info!("");
    }
}

#[derive(Clone, Debug)]
pub struct RouteInfo {
    pub method: String,
    pub path: String,
}

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: Arc<DatabaseConnection>,
}

impl AppState {
    pub fn new(config: Arc<Config>, db: DatabaseConnection) -> Self {
        Self {
            config,
            db: Arc::new(db),
        }
    }
}

pub fn create_app(config: &Config) -> axum::Router<AppState> {
    let api_v1_prefix = config.app.api_version.clone();

    let cors_origins: Vec<HeaderValue> = config
        .cors
        .origins
        .iter()
        .map(|origin| {
            origin
                .parse::<HeaderValue>()
                .expect("Invalid CORS origin in CORS_ORIGINS")
        })
        .collect();

    let cors = CorsLayer::new()
        .allow_origin(cors_origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            HeaderName::from_static("x-client-type"),
        ])
        .allow_credentials(true);

    let router = axum::Router::new()
        .route("/api-docs/openapi.json", get(openapi::openapi_json))
        .nest(&api_v1_prefix, api_v1_router())
        .layer(TraceLayer::new_for_http())
        .layer(middleware::from_fn(authenticate))
        .layer(cors);

    // Optional: route registry
    {
        let mut registry = ROUTE_REGISTRY.write().unwrap();
        registry.register("GET", "/api-docs/openapi.json");
        registry.register("GET", "/api/v1/health");
        registry.register("POST", "/api/v1/auth/login");
        registry.register("GET", "/api/v1/auth/refresh-token");
        registry.register("GET", "/api/v1/auth/register-user");
        registry.register("GET", "/api/v1/auth/me");
        registry.register("GET", "/api/v1/topics/{topic_id}/quizzes");
        registry.register("GET", "/api/v1/quizzes/{quiz_id}");
        registry.register("POST", "/api/v1/quizzes/{quiz_id}/attempts");
        registry.register("POST", "/api/v1/attempts/{attempt_id}/submit");
        registry.register("GET", "/api/v1/attempts/{attempt_id}/result");
        registry.register("POST", "/api/v1/community/threads");
        registry.register("GET", "/api/v1/community/topics/{topic_id}/threads");
        registry.register("GET", "/api/v1/community/threads/{thread_id}");
        registry.register("POST", "/api/v1/community/threads/{thread_id}/posts");
        registry.register("POST", "/api/v1/community/threads/{thread_id}/attach-note");
        registry.register("GET", "/api/v1/subjects");
        registry.register("GET", "/api/v1/subjects/{subject_id}/chapters");
        registry.register("GET", "/api/v1/chapters/{chapter_id}/topics");
        registry.register("GET", "/api/v1/topics/{topic_id}");
        registry.register("GET", "/api/v1/topics/{topic_id}/videos");
        registry.register("GET", "/api/v1/topics/{topic_id}/notes/official");
        registry.register("GET", "/api/v1/videos/{video_id}/offline-token");
        registry.register("GET", "/api/v1/videos/{video_id}/playback-token");
        registry.register("GET", "/api/v1/notes");
        registry.register("POST", "/api/v1/notes");
        registry.register("PATCH", "/api/v1/notes/{note_id}");
        registry.register("DELETE", "/api/v1/notes/{note_id}");
        registry.register("POST", "/api/v1/progress/update");
        registry.register("DELETE", "/api/v1/progress/summary");
        registry.register("POST", "/api/v1/recall/start");
        registry.register("GET", "/api/v1/recall/{session_id}/mcqs");
        registry.register("POST", "/api/v1/recall/{session_id}/mcqs/submit");
        registry.register("GET", "/api/v1/recall/{session_id}/result");
        registry.register("GET", "/api/v1/live/classes/{class_id}/recording");
        registry.register("POST", "/api/v1/live/classes/{class_id}/join");
        registry.register("GET", "/api/v1/live/classes/upcoming");
        registry.register("GET", "/api/v1/notifications");
        registry.register("POST", "/api/v1/notifications/status");
    }

    router
}

pub fn print_routes() {
    let registry = ROUTE_REGISTRY.read().unwrap();
    registry.print();
    drop(registry);
}

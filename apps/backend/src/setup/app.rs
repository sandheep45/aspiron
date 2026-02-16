use axum::http::header::{AUTHORIZATION, CONTENT_TYPE};
use axum::http::{HeaderValue, Method};
use axum::routing::get;
use std::sync::{Arc, LazyLock, RwLock};

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

const API_V1_PREFIX: &str = "/api/v1";

pub fn create_app() -> axum::Router {
    // CORS configuration
    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS, // required for preflight
        ])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION])
        .allow_credentials(true); // required if frontend uses cookies/auth

    let router = axum::Router::new()
        .route("/api-docs/openapi.json", get(openapi::openapi_json))
        .nest(API_V1_PREFIX, api_v1_router())
        .layer(TraceLayer::new_for_http())
        .layer(cors); // only ONE cors layer

    // Optional: route registry
    let mut registry = ROUTE_REGISTRY.write().unwrap();
    registry.register("GET", "/api/v1/health");
    registry.register("GET", "/api-docs/openapi.json");
    drop(registry);

    router
}

pub fn print_routes() {
    let registry = ROUTE_REGISTRY.read().unwrap();
    registry.print();
    drop(registry);
}

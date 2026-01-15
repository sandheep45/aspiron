use std::sync::{Arc, LazyLock, RwLock};

use crate::{routes, setup::config::Config};
use sea_orm::DatabaseConnection;

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

pub fn create_app() -> axum::Router {
    let router = axum::Router::new()
        .nest("/api", routes::health::router())
        .layer(tower_http::trace::TraceLayer::new_for_http())
        .layer(tower_http::cors::CorsLayer::permissive());

    let mut registry = ROUTE_REGISTRY.write().unwrap();
    registry.register("GET", "/api/health");
    drop(registry);

    router
}

pub fn print_routes() {
    let registry = ROUTE_REGISTRY.read().unwrap();
    registry.print();
    drop(registry);
}

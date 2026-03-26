use std::net::SocketAddr;
use std::sync::Arc;

use axum_server::tls_rustls::RustlsConfig;
use backend::setup::{app, config, telemetry};
use sea_orm::DatabaseConnection;

use backend::setup::config::SslConfig;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    telemetry::init_from_env();

    tracing::info!("Starting Aspiron Backend...");

    let config = config::Config::from_env();
    tracing::info!("Configuration loaded successfully");

    let db = connect_to_database(&config).await?;
    tracing::info!("Database connected successfully");

    let state = app::AppState::new(Arc::new(config.clone()), db);

    let app = app::create_app(&config, state.clone()).with_state(state.clone());
    app::print_routes();

    let addr = state.config.app.addr();

    if state.config.app.env == "development" {
        tracing::info!("Development mode: enabling TLS with HTTPS");
        serve_https(addr, app, &state.config.ssl).await?;
    } else {
        tracing::warn!("Running without TLS (non-development mode)");
        serve_http(addr, app).await?;
    }

    Ok(())
}

async fn serve_https(
    addr: SocketAddr,
    app: axum::Router,
    ssl: &SslConfig,
) -> Result<(), anyhow::Error> {
    let tls_config = RustlsConfig::from_pem_file(&ssl.cert_path, &ssl.key_path)
        .await
        .expect("Failed to load TLS certificate");

    tracing::info!("Server starting on https://{}", addr);

    axum_server::bind_rustls(addr, tls_config)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

async fn serve_http(addr: SocketAddr, app: axum::Router) -> Result<(), anyhow::Error> {
    tracing::info!("Server starting on http://{}", addr);

    axum_server::bind(addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

async fn connect_to_database(config: &config::Config) -> Result<DatabaseConnection, anyhow::Error> {
    let db_url = config.database_url();
    let db = sea_orm::Database::connect(&db_url).await?;
    Ok(db)
}

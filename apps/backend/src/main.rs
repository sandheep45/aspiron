use std::sync::Arc;

use backend::setup::{app, config, telemetry};
use sea_orm::DatabaseConnection;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    telemetry::init_from_env();

    tracing::info!("Starting Aspiron Backend...");

    let config = config::Config::from_env();
    tracing::info!("Configuration loaded successfully");

    let app = app::create_app(&config);
    app::print_routes();

    let db = connect_to_database(&config).await?;
    tracing::info!("Database connected successfully");

    let state = app::AppState::new(Arc::new(config), db);

    let addr = state.config.app.addr();

    tracing::info!("Server starting on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn connect_to_database(config: &config::Config) -> Result<DatabaseConnection, anyhow::Error> {
    let db_url = config.database_url();

    let db = sea_orm::Database::connect(&db_url).await?;

    Ok(db)
}

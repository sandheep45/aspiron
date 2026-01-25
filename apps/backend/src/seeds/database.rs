use anyhow::Result;
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use std::time::Duration;

use crate::seeds::SeedConfig;

pub struct DatabaseManager {
    connection: DatabaseConnection,
}

impl DatabaseManager {
    pub async fn new(_config: &SeedConfig) -> Result<Self> {
        let database_url = Self::build_database_url()?;

        let mut opt = ConnectOptions::new(database_url);
        opt.max_connections(10)
            .min_connections(1)
            .connect_timeout(Duration::from_secs(30))
            .idle_timeout(Duration::from_secs(600));

        let connection = Database::connect(opt)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))?;

        Ok(Self { connection })
    }

    pub fn get_connection(&self) -> &DatabaseConnection {
        &self.connection
    }

    fn build_database_url() -> Result<String> {
        let username = std::env::var("DATABASE_USERNAME").unwrap_or_else(|_| "rivet".to_string());
        let password = std::env::var("DATABASE_PASSWORD").unwrap_or_else(|_| "secret".to_string());
        let host = std::env::var("DATABASE_HOST").unwrap_or_else(|_| "localhost".to_string());
        let port = std::env::var("DATABASE_PORT").unwrap_or_else(|_| "5432".to_string());
        let database_name =
            std::env::var("DATABASE_NAME").unwrap_or_else(|_| "rivet-v2".to_string());

        Ok(format!(
            "postgres://{}:{}@{}:{}/{}",
            username, password, host, port, database_name
        ))
    }
}

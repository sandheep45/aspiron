use std::sync::OnceLock;

use tracing_subscriber::{EnvFilter, Layer, fmt, prelude::*};

static TRACING_INIT: OnceLock<()> = OnceLock::new();

#[derive(Debug, Clone)]
pub struct TracingConfig {
    pub level: String,
    pub format: String,
}

impl Default for TracingConfig {
    fn default() -> Self {
        Self {
            level: "info".to_string(),
            format: "pretty".to_string(),
        }
    }
}

pub fn init(config: &TracingConfig) {
    let _ = TRACING_INIT.get_or_init(|| {
        let env_filter =
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(&config.level));

        let subscriber =
            tracing_subscriber::registry()
                .with(env_filter)
                .with(match config.format.as_str() {
                    "pretty" => fmt::layer().with_ansi(true).pretty().boxed(),
                    "json" => fmt::layer().with_ansi(false).json().boxed(),
                    _ => fmt::layer().with_ansi(false).json().boxed(),
                });

        tracing::subscriber::set_global_default(subscriber)
            .expect("Failed to set tracing subscriber");
    });
}

pub fn init_from_env() {
    let level = std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string());
    let format = std::env::var("LOG_FORMAT").unwrap_or_else(|_| "pretty".to_string());

    init(&TracingConfig { level, format });
}

pub fn request_id() -> String {
    use uuid::Uuid;
    Uuid::new_v4().to_string()
}

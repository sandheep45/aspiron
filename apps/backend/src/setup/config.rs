use std::net::SocketAddr;

#[derive(Debug, Clone)]
pub struct Config {
    pub app: AppConfig,
    pub database: DatabaseConfig,
    pub jwt: JwtConfig,
    pub logging: LoggingConfig,
    pub cors: CorsConfig,
}

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    pub env: String,
    pub api_version: String,
}

impl AppConfig {
    pub fn addr(&self) -> SocketAddr {
        format!("{}:{}", self.host, self.port)
            .parse()
            .unwrap_or_else(|_| {
                eprintln!("Invalid socket address, using default 0.0.0.0:8080");
                "0.0.0.0:8080".parse().unwrap()
            })
    }
}

#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub name: String,
    pub pool_size: u32,
}

#[derive(Debug, Clone)]
pub struct JwtConfig {
    pub secret: String,
    pub expiry_hours: u64,
    pub cookie_name: String,
}

#[derive(Debug, Clone)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
}

#[derive(Debug, Clone)]
pub struct CorsConfig {
    pub origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Self {
        Config {
            app: AppConfig {
                host: std::env::var("APP_HOST").unwrap_or_else(|_| {
                    eprintln!("APP_HOST not set, using '0.0.0.0'");
                    "0.0.0.0".to_string()
                }),
                port: std::env::var("APP_PORT")
                    .unwrap_or_else(|_| "8080".to_string())
                    .parse()
                    .unwrap_or(8080),
                env: std::env::var("APP_ENV").unwrap_or_else(|_| {
                    eprintln!("APP_ENV not set, using 'development'");
                    "development".to_string()
                }),
                api_version: std::env::var("PUBLIC_ACTIVE_API_VERSION")
                    .expect("PUBLIC_ACTIVE_API_VERSION environment variable is not set"),
            },
            database: DatabaseConfig {
                host: std::env::var("DATABASE_HOST").unwrap_or_else(|_| {
                    eprintln!("DATABASE_HOST not set, using 'localhost'");
                    "localhost".to_string()
                }),
                port: std::env::var("DATABASE_PORT")
                    .unwrap_or_else(|_| "5432".to_string())
                    .parse()
                    .unwrap_or(5432),
                username: std::env::var("DATABASE_USERNAME").unwrap_or_else(|_| {
                    eprintln!("DATABASE_USERNAME not set, using 'postgres'");
                    "postgres".to_string()
                }),
                password: std::env::var("DATABASE_PASSWORD").unwrap_or_else(|_| {
                    eprintln!("DATABASE_PASSWORD not set, using 'password'");
                    "password".to_string()
                }),
                name: std::env::var("DATABASE_NAME").unwrap_or_else(|_| {
                    eprintln!("DATABASE_NAME not set, using 'aspiron'");
                    "aspiron".to_string()
                }),
                pool_size: std::env::var("DATABASE_POOL_SIZE")
                    .unwrap_or_else(|_| "10".to_string())
                    .parse()
                    .unwrap_or(10),
            },
            jwt: JwtConfig {
                secret: std::env::var("JWT_SECRET").unwrap_or_else(|_| {
                    eprintln!("JWT_SECRET not set, using default (INSECURE)");
                    "insecure-default-secret-for-development-only".to_string()
                }),
                expiry_hours: std::env::var("JWT_EXPIRY_HOURS")
                    .unwrap_or_else(|_| "24".to_string())
                    .parse()
                    .unwrap_or(24),
                cookie_name: std::env::var("JWT_COOKIE_NAME").unwrap_or_else(|_| {
                    eprintln!("JWT_COOKIE_NAME not set, using 'jwt'");
                    "jwt".to_string()
                }),
            },
            logging: LoggingConfig {
                level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| {
                    eprintln!("LOG_LEVEL not set, using 'info'");
                    "info".to_string()
                }),
                format: std::env::var("LOG_FORMAT").unwrap_or_else(|_| {
                    eprintln!("LOG_FORMAT not set, using 'json'");
                    "json".to_string()
                }),
            },
            cors: CorsConfig {
                origins: std::env::var("CORS_ORIGINS")
                    .expect("CORS_ORIGINS environment variable is not set")
                    .split(',')
                    .map(|s| s.to_string())
                    .collect(),
            },
        }
    }

    pub fn database_url(&self) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            self.database.username,
            self.database.password,
            self.database.host,
            self.database.port,
            self.database.name
        )
    }
}

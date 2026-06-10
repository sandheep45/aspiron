use std::net::SocketAddr;

#[derive(Debug, Clone)]
pub struct Config {
    pub app: AppConfig,
    pub database: DatabaseConfig,
    pub jwt: JwtConfig,
    pub logging: LoggingConfig,
    pub cors: CorsConfig,
    pub ssl: SslConfig,
    pub s3: S3Config,
}

#[derive(Debug, Clone)]
pub struct SslConfig {
    pub cert_path: String,
    pub key_path: String,
}

impl SslConfig {
    pub fn from_manifest_dir() -> Self {
        let root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .and_then(|p| p.parent())
            .unwrap();
        Self {
            cert_path: root
                .join("local.aspiron.test.pem")
                .to_string_lossy()
                .into_owned(),
            key_path: root
                .join("local.aspiron.test-key.pem")
                .to_string_lossy()
                .into_owned(),
        }
    }
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
    pub access_token_expiry_seconds: u64,
    pub refresh_token_expiry_seconds: u64,
    pub cookie_name: String,
}

#[derive(Debug, Clone)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
}

#[derive(Debug, Clone)]
pub struct S3Config {
    pub endpoint: Option<String>,
    pub region: String,
    pub bucket: String,
    pub access_key_id: Option<String>,
    pub secret_access_key: Option<String>,
}

#[derive(Debug, Clone)]
pub struct CorsConfig {
    pub origins: Vec<String>,
}

impl Config {
    pub fn for_test() -> Self {
        Self {
            app: AppConfig {
                host: "127.0.0.1".to_string(),
                port: 0,
                env: "test".to_string(),
                api_version: "/api/v1".to_string(),
            },
            database: DatabaseConfig {
                host: "127.0.0.1".to_string(),
                port: 5432,
                username: "postgres".to_string(),
                password: "postgres".to_string(),
                name: "test_aspiron".to_string(),
                pool_size: 1,
            },
            jwt: JwtConfig {
                secret: "test-jwt-secret-for-testing-only-32chars!!".to_string(),
                access_token_expiry_seconds: 3600,
                refresh_token_expiry_seconds: 86400,
                cookie_name: "test_jwt".to_string(),
            },
            logging: LoggingConfig {
                level: "error".to_string(),
                format: "compact".to_string(),
            },
            cors: CorsConfig {
                origins: vec!["http://localhost:3000".to_string()],
            },
            ssl: SslConfig {
                cert_path: String::new(),
                key_path: String::new(),
            },
            s3: S3Config {
                endpoint: None,
                region: "us-east-1".to_string(),
                bucket: "test-uploads".to_string(),
                access_key_id: None,
                secret_access_key: None,
            },
        }
    }

    pub fn from_env() -> Self {
        Config {
            app: AppConfig {
                host: std::env::var("APP_HOST").unwrap_or_else(|_| {
                    eprintln!("APP_HOST not set, using '0.0.0.0'");
                    "0.0.0.0".to_string()
                }),
                port: std::env::var("APP_PORT")
                    .unwrap_or_else(|_| "8082".to_string())
                    .parse()
                    .unwrap_or(8082),
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
                access_token_expiry_seconds: std::env::var("JWT_ACCESS_TOKEN_EXPIRY_SECONDS")
                    .unwrap_or_else(|_| "86400".to_string())
                    .parse()
                    .unwrap_or(24 * 60 * 60),
                refresh_token_expiry_seconds: std::env::var("JWT_REFRESH_TOKEN_EXPIRY_SECONDS")
                    .unwrap_or_else(|_| "604800".to_string())
                    .parse()
                    .unwrap_or(7 * 24 * 60 * 60),
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
            s3: S3Config {
                endpoint: std::env::var("S3_ENDPOINT").ok(),
                region: std::env::var("S3_REGION").unwrap_or_else(|_| {
                    eprintln!("S3_REGION not set, using 'us-east-1'");
                    "us-east-1".to_string()
                }),
                bucket: std::env::var("S3_BUCKET").unwrap_or_else(|_| {
                    eprintln!("S3_BUCKET not set, using 'aspiron-uploads'");
                    "aspiron-uploads".to_string()
                }),
                access_key_id: std::env::var("AWS_ACCESS_KEY_ID").ok(),
                secret_access_key: std::env::var("AWS_SECRET_ACCESS_KEY").ok(),
            },
            ssl: SslConfig::from_manifest_dir(),
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

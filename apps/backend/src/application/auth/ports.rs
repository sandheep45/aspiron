use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::auth::entities::{CurrentUser, User};
use crate::setup::error::AppError;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError>;
    async fn find_by_id(&self, user_id: Uuid) -> Result<Option<User>, AppError>;
    async fn get_current_user(&self, user_id: Uuid) -> Result<CurrentUser, AppError>;
}

#[async_trait]
pub trait TokenService: Send + Sync {
    fn generate_access_token(&self, user_id: &str) -> Result<String, AppError>;
    fn generate_refresh_token(&self, user_id: &str) -> Result<String, AppError>;
    fn decode_token(&self, token: &str) -> Result<Claims, AppError>;
    fn access_token_expiry(&self) -> u64;
    fn refresh_token_expiry(&self) -> u64;
}

#[async_trait]
pub trait PasswordService: Send + Sync {
    fn verify(&self, password: &str, hash: &str) -> Result<bool, AppError>;
}

pub fn create_user_repo(db: Arc<DatabaseConnection>) -> Arc<dyn UserRepository> {
    Arc::new(crate::infra::db::repositories::user_repo::SeaOrmUserRepository::new(db))
}

pub fn create_token_service(
    jwt_secret: String,
    access_expiry: u64,
    refresh_expiry: u64,
) -> Arc<dyn TokenService> {
    Arc::new(crate::infra::auth::jwt::JwtService::new(
        jwt_secret,
        access_expiry,
        refresh_expiry,
    ))
}

pub fn create_password_service() -> Arc<dyn PasswordService> {
    Arc::new(crate::infra::auth::password::BcryptPasswordService)
}

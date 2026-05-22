pub mod get_current_user;
pub mod login;
pub mod ports;
pub mod refresh_token;

use std::sync::Arc;

use crate::setup::config::Config;

#[derive(Clone)]
pub struct AuthApplicationState {
    pub user_repo: Arc<dyn ports::UserRepository>,
    pub token_service: Arc<dyn ports::TokenService>,
    pub password_service: Arc<dyn ports::PasswordService>,
    pub access_token_expiry: u64,
    pub refresh_token_expiry: u64,
    pub cookie_name: String,
    pub is_development: bool,
}

impl AuthApplicationState {
    pub fn new(
        user_repo: Arc<dyn ports::UserRepository>,
        token_service: Arc<dyn ports::TokenService>,
        password_service: Arc<dyn ports::PasswordService>,
        config: &Config,
    ) -> Self {
        Self {
            user_repo,
            token_service,
            password_service,
            access_token_expiry: config.jwt.access_token_expiry_seconds,
            refresh_token_expiry: config.jwt.refresh_token_expiry_seconds,
            cookie_name: config.jwt.cookie_name.clone(),
            is_development: config.app.env == "development",
        }
    }
}

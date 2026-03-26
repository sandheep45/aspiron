use std::sync::Arc;

use crate::entries::dtos::response::auth::AuthResponse;
use crate::services::auth::service::{AuthService, LoginCookies};
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct AuthState {
    pub auth_service: AuthService,
    pub jwt_secret: String,
    pub access_token_expiry: u64,
    pub refresh_token_expiry: u64,
    pub cookie_name: String,
    pub is_development: bool,
    pub refresh_cookie_name: String,
}

impl AuthState {
    pub fn new(
        db: Arc<sea_orm::DatabaseConnection>,
        jwt_secret: String,
        access_token_expiry: u64,
        refresh_token_expiry: u64,
        cookie_name: String,
        is_development: bool,
    ) -> Self {
        let refresh_cookie_name = format!("{}_refresh", cookie_name);
        Self {
            auth_service: AuthService::new(db),
            jwt_secret,
            access_token_expiry,
            refresh_token_expiry,
            cookie_name,
            is_development,
            refresh_cookie_name,
        }
    }

    pub async fn login_with_cookies(
        &self,
        email: &str,
        password: &str,
        client_type: Option<crate::constants::AllowedClientType>,
    ) -> Result<(AuthResponse, Option<LoginCookies>), AppError> {
        let user = self.auth_service.authenticate(email, password).await?;
        let (access_token, refresh_token) = self.auth_service.generate_tokens(
            &user.id.to_string(),
            &self.jwt_secret,
            self.access_token_expiry,
            self.refresh_token_expiry,
        )?;
        let mut auth_response = self
            .auth_service
            .build_auth_response(&user.id.to_string())
            .await?;
        auth_response.access_token = access_token.clone();
        auth_response.refresh_token = refresh_token.clone();
        auth_response.expires_in = self.access_token_expiry as i64;

        let cookies = match client_type {
            Some(crate::constants::AllowedClientType::BROWSER) => Some(LoginCookies {
                access_token,
                refresh_token,
                cookie_name: self.cookie_name.clone(),
                is_development: self.is_development,
            }),
            Some(crate::constants::AllowedClientType::MOBILE) | None => None,
        };

        Ok((auth_response, cookies))
    }
}

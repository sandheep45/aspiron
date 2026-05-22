use uuid::Uuid;

use super::ports::{PasswordService, TokenService, UserRepository};
use crate::domain::auth::errors::DomainError;
use crate::setup::error::AppError;

pub struct LoginOutput {
    pub user_id: Uuid,
    pub access_token: String,
    pub refresh_token: String,
    pub access_expiry: u64,
}

pub async fn execute_login(
    user_repo: &dyn UserRepository,
    password_service: &dyn PasswordService,
    token_service: &dyn TokenService,
    email: &str,
    password: &str,
) -> Result<LoginOutput, AppError> {
    let user = user_repo
        .find_by_email(email)
        .await?
        .ok_or(AppError::auth(DomainError::InvalidCredentials))?;

    if !user.is_active {
        return Err(AppError::auth(DomainError::AccountNotActive));
    }

    let valid = password_service
        .verify(password, &user.password_hash)
        .map_err(|_| AppError::auth("Password verification failed"))?;

    if !valid {
        return Err(AppError::auth(DomainError::InvalidCredentials));
    }

    let access_token = token_service.generate_access_token(&user.id.to_string())?;
    let refresh_token = token_service.generate_refresh_token(&user.id.to_string())?;

    Ok(LoginOutput {
        user_id: user.id.0,
        access_token,
        refresh_token,
        access_expiry: token_service.access_token_expiry(),
    })
}

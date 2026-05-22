use uuid::Uuid;

use super::ports::{TokenService, UserRepository};
use crate::setup::error::AppError;

pub async fn execute_refresh_token(
    user_repo: &dyn UserRepository,
    token_service: &dyn TokenService,
    refresh_token: &str,
) -> Result<(String, String, Uuid), AppError> {
    let claims = token_service.decode_token(refresh_token)?;

    let user_id: Uuid = claims
        .sub
        .parse()
        .map_err(|_| AppError::auth("Invalid user ID in token"))?;

    let _user = user_repo
        .find_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::auth("User not found"))?;

    let new_access = token_service.generate_access_token(&user_id.to_string())?;
    let new_refresh = token_service.generate_refresh_token(&user_id.to_string())?;

    Ok((new_access, new_refresh, user_id))
}

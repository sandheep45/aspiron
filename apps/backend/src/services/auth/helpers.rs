use cookie::{Cookie, SameSite, time::Duration};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

use crate::entries::dtos::response::auth::{AuthResponse, UserResponse};
use crate::entries::entities::user::{Entity as UserEntity, Model as UserModel};
use crate::setup::error::AppError;
use crate::utils::jwt::{encode_access_token, encode_refresh_token};

pub fn build_token_cookie(
    name: String,
    value: String,
    max_age: Duration,
    is_development: bool,
) -> Cookie<'static> {
    let mut builder = Cookie::build((name, value))
        .http_only(true)
        .path("/")
        .max_age(max_age);

    if is_development {
        builder = builder.secure(true).same_site(SameSite::None);
    } else {
        builder = builder.secure(true).same_site(SameSite::Strict);
    }

    builder.build()
}

pub fn build_auth_response(
    access_token: String,
    refresh_token: String,
    user: UserModel,
) -> AuthResponse {
    AuthResponse {
        access_token,
        refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: 3600,
        user: UserResponse {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        },
    }
}

pub async fn validate_credentials(
    db: &sea_orm::DatabaseConnection,
    email: &str,
    password: &str,
) -> Result<UserModel, AppError> {
    let user = UserEntity::find()
        .filter(crate::entries::entities::user::Column::Email.eq(email))
        .one(db)
        .await
        .map_err(AppError::Database)?
        .ok_or_else(|| AppError::auth("Invalid credentials"))?;

    let password_valid = bcrypt::verify(password, &user.password_hash)
        .map_err(|_| AppError::auth("Password verification failed"))?;

    if !password_valid {
        return Err(AppError::auth("Invalid credentials"));
    }

    Ok(user)
}

pub fn generate_tokens(user_id: &str, jwt_secret: &str) -> Result<(String, String), AppError> {
    let access_token = encode_access_token(user_id, jwt_secret)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to generate access token")))?;
    let refresh_token = encode_refresh_token(user_id, jwt_secret)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to generate refresh token")))?;
    Ok((access_token, refresh_token))
}

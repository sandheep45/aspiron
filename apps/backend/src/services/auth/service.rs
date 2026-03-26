use std::sync::Arc;

use sea_orm::DatabaseConnection;

use crate::entries::dtos::response::auth::{
    AuthPermissionResponse, AuthResponse, AuthRoleResponse, AuthUserResponse,
};
use crate::entries::dtos::response::users::UserProfileResponse;
use crate::services::users::repository::UserRepository;
use crate::setup::error::AppError;
use crate::utils::jwt::{encode_access_token, encode_refresh_token};

pub type UserModel = <crate::entries::entities::user::Entity as sea_orm::EntityTrait>::Model;

#[derive(Clone)]
pub struct AuthService {
    user_repository: UserRepository,
}

#[derive(Clone)]
pub struct LoginResponse {
    pub auth_response: AuthResponse,
    pub cookies: Option<LoginCookies>,
}

#[derive(Clone)]
pub struct LoginCookies {
    pub access_token: String,
    pub refresh_token: String,
    pub cookie_name: String,
    pub is_development: bool,
}

impl AuthService {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self {
            user_repository: UserRepository::new(db),
        }
    }

    pub async fn authenticate(&self, email: &str, password: &str) -> Result<UserModel, AppError> {
        let user = self.user_repository.get_user_entity_by_email(email).await?;

        let password_valid = bcrypt::verify(password, &user.password_hash)
            .map_err(|_| AppError::auth("Password verification failed"))?;

        if !password_valid {
            return Err(AppError::auth("Invalid credentials"));
        }

        Ok(user)
    }

    pub async fn build_auth_response(&self, user_id: &str) -> Result<AuthResponse, AppError> {
        let user_uuid = uuid::Uuid::parse_str(user_id)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Invalid user ID")))?;

        let profile: UserProfileResponse = self
            .user_repository
            .get_user_profile_by_id(user_uuid)
            .await?;

        let user = AuthUserResponse {
            id: profile.user.id,
            email: profile.user.email,
            first_name: profile.profile.first_name,
            last_name: profile.profile.last_name,
            avatar_url: profile.profile.avatar_url,
            is_active: profile.user.is_active,
            created_at: profile.user.created_at,
            updated_at: profile.user.updated_at,
        };

        let roles: Vec<AuthRoleResponse> = profile
            .roles
            .into_iter()
            .map(|role| AuthRoleResponse {
                name: role.name,
                display_name: role.display_name,
                description: role.description,
                is_system_role: role.is_system_role,
            })
            .collect();

        let permissions: Vec<AuthPermissionResponse> = profile
            .permissions
            .into_iter()
            .map(|perm| AuthPermissionResponse {
                name: perm.name,
                resource_type: perm.resource_type,
                action: perm.action,
                description: perm.description,
            })
            .collect();

        Ok(AuthResponse {
            access_token: String::new(),
            refresh_token: String::new(),
            token_type: "Bearer".to_string(),
            expires_in: 60,
            user,
            roles,
            permissions,
        })
    }

    pub fn generate_tokens(
        &self,
        user_id: &str,
        jwt_secret: &str,
        access_token_expiry: u64,
        refresh_token_expiry: u64,
    ) -> Result<(String, String), AppError> {
        let access_token = encode_access_token(user_id, jwt_secret, access_token_expiry)
            .map_err(|_| AppError::auth("Failed to generate access token"))?;
        let refresh_token = encode_refresh_token(user_id, jwt_secret, refresh_token_expiry)
            .map_err(|_| AppError::auth("Failed to generate refresh token"))?;
        Ok((access_token, refresh_token))
    }

    pub async fn generate_new_access_token(
        &self,
        user_id: &str,
        jwt_secret: &str,
        access_token_expiry: u64,
        refresh_token_expiry: u64,
    ) -> Result<AuthResponse, AppError> {
        let mut auth_response = self.build_auth_response(user_id).await?;

        let access_token = encode_access_token(user_id, jwt_secret, access_token_expiry)
            .map_err(|_| AppError::auth("Failed to generate access token"))?;
        let refresh_token = encode_refresh_token(user_id, jwt_secret, refresh_token_expiry)
            .map_err(|_| AppError::auth("Failed to generate refresh token"))?;

        auth_response.access_token = access_token;
        auth_response.refresh_token = refresh_token;
        auth_response.expires_in = access_token_expiry as i64;
        Ok(auth_response)
    }

    pub async fn login(
        &self,
        email: &str,
        password: &str,
        jwt_secret: &str,
        access_token_expiry: u64,
        refresh_token_expiry: u64,
    ) -> Result<AuthResponse, AppError> {
        let user = self.authenticate(email, password).await?;
        let (access_token, refresh_token) = self.generate_tokens(
            &user.id.to_string(),
            jwt_secret,
            access_token_expiry,
            refresh_token_expiry,
        )?;
        let mut auth_response = self.build_auth_response(&user.id.to_string()).await?;
        auth_response.access_token = access_token;
        auth_response.refresh_token = refresh_token;
        auth_response.expires_in = access_token_expiry as i64;
        Ok(auth_response)
    }

    pub async fn get_current_user(&self, user_id: uuid::Uuid) -> Result<AuthResponse, AppError> {
        self.build_auth_response(&user_id.to_string()).await
    }
}

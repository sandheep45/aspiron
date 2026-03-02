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
            expires_in: 3600,
            user,
            roles,
            permissions,
        })
    }

    pub fn generate_tokens(
        &self,
        user_id: &str,
        jwt_secret: &str,
    ) -> Result<(String, String), AppError> {
        let access_token = encode_access_token(user_id, jwt_secret)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to generate access token")))?;
        let refresh_token = encode_refresh_token(user_id, jwt_secret)
            .map_err(|_| AppError::Internal(anyhow::anyhow!("Failed to generate refresh token")))?;
        Ok((access_token, refresh_token))
    }
}

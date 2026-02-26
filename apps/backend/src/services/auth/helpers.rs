use cookie::{Cookie, SameSite, time::Duration};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};

use crate::entries::dtos::response::auth::AuthResponse;
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

pub async fn build_auth_response(
    db: &DatabaseConnection,
    access_token: String,
    refresh_token: String,
    user: UserModel,
) -> Result<AuthResponse, AppError> {
    use crate::entries::dtos::response::auth::{
        AuthPermissionResponse, AuthRoleResponse, AuthUserResponse,
    };
    use crate::entries::entities::permission::Entity as PermissionEntity;
    use crate::entries::entities::role::Entity as RoleEntity;
    use crate::entries::entities::role_permission::Entity as RolePermissionEntity;
    use crate::entries::entities::user_role::Entity as UserRoleEntity;

    let user_id = user.id;

    let user_roles = UserRoleEntity::find()
        .filter(crate::entries::entities::user_role::Column::UserId.eq(user_id))
        .filter(crate::entries::entities::user_role::Column::IsActive.eq(true))
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let role_ids: Vec<uuid::Uuid> = user_roles
        .into_iter()
        .map(|user_role| user_role.role_id)
        .collect();

    let roles = RoleEntity::find()
        .filter(crate::entries::entities::role::Column::Id.is_in(role_ids.clone()))
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let role_permission_entities = RolePermissionEntity::find()
        .filter(crate::entries::entities::role_permission::Column::RoleId.is_in(role_ids))
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let permission_ids: Vec<uuid::Uuid> = role_permission_entities
        .into_iter()
        .map(|role_permission| role_permission.permission_id)
        .collect();

    let permissions = PermissionEntity::find()
        .filter(crate::entries::entities::permission::Column::Id.is_in(permission_ids))
        .all(db)
        .await
        .map_err(AppError::Database)?;

    let user_response = AuthUserResponse {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };

    let roles_response: Vec<AuthRoleResponse> = roles
        .into_iter()
        .map(|role| AuthRoleResponse {
            name: role.name,
            display_name: role.display_name,
            description: role.description,
            is_system_role: role.is_system_role,
        })
        .collect();

    let permissions_response: Vec<AuthPermissionResponse> = permissions
        .into_iter()
        .map(|permission| AuthPermissionResponse {
            name: permission.name,
            resource_type: permission.resource_type,
            action: permission.action,
            description: permission.description,
        })
        .collect();

    Ok(AuthResponse {
        access_token,
        refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: 3600,
        user: user_response,
        roles: roles_response,
        permissions: permissions_response,
    })
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

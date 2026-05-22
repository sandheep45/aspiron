use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::application::auth::ports::UserRepository;
use crate::domain::auth::entities::{CurrentUser, PermissionInfo, RoleInfo, User};
use crate::domain::auth::value_objects::{Email, UserId};
use crate::entries::entities::permission::Entity as PermissionEntity;
use crate::entries::entities::role::Entity as RoleEntity;
use crate::entries::entities::role_permission::Entity as RolePermissionEntity;
use crate::entries::entities::user::Entity as UserEntity;
use crate::entries::entities::user_profile::Entity as UserProfileEntity;
use crate::entries::entities::user_role::Entity as UserRoleEntity;
use crate::setup::error::AppError;

pub struct SeaOrmUserRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmUserRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl UserRepository for SeaOrmUserRepository {
    async fn find_by_email(&self, email: &str) -> Result<Option<User>, AppError> {
        let user = UserEntity::find()
            .filter(crate::entries::entities::user::Column::Email.eq(email))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(user.map(|m| User {
            id: UserId(m.id),
            email: Email(m.email),
            password_hash: m.password_hash,
            is_active: m.is_active,
        }))
    }

    async fn find_by_id(&self, user_id: Uuid) -> Result<Option<User>, AppError> {
        let user = UserEntity::find_by_id(user_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(user.map(|m| User {
            id: UserId(m.id),
            email: Email(m.email),
            password_hash: m.password_hash,
            is_active: m.is_active,
        }))
    }

    async fn get_current_user(&self, user_id: Uuid) -> Result<CurrentUser, AppError> {
        let user = UserEntity::find_by_id(user_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("User not found"))?;

        let user_profile = UserProfileEntity::find_by_id(user_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let user_roles = UserRoleEntity::find()
            .filter(crate::entries::entities::user_role::Column::UserId.eq(user_id))
            .filter(crate::entries::entities::user_role::Column::IsActive.eq(true))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let role_ids: Vec<Uuid> = user_roles.iter().map(|ur| ur.role_id).collect();

        let roles = if role_ids.is_empty() {
            vec![]
        } else {
            RoleEntity::find()
                .filter(crate::entries::entities::role::Column::Id.is_in(role_ids))
                .all(&*self.db)
                .await
                .map_err(AppError::Database)?
        };

        let role_ids_for_permissions: Vec<Uuid> = roles.iter().map(|r| r.id).collect();

        let role_permissions = if role_ids_for_permissions.is_empty() {
            vec![]
        } else {
            RolePermissionEntity::find()
                .filter(
                    crate::entries::entities::role_permission::Column::RoleId
                        .is_in(role_ids_for_permissions),
                )
                .all(&*self.db)
                .await
                .map_err(AppError::Database)?
        };

        let permission_ids: Vec<Uuid> =
            role_permissions.iter().map(|rp| rp.permission_id).collect();

        let permissions = if permission_ids.is_empty() {
            vec![]
        } else {
            PermissionEntity::find()
                .filter(crate::entries::entities::permission::Column::Id.is_in(permission_ids))
                .all(&*self.db)
                .await
                .map_err(AppError::Database)?
        };

        let roles_info: Vec<RoleInfo> = roles
            .into_iter()
            .map(|r| RoleInfo {
                name: format!("{:?}", r.name),
                display_name: r.display_name,
                description: r.description,
                is_system_role: r.is_system_role,
            })
            .collect();

        let permissions_info: Vec<PermissionInfo> = permissions
            .into_iter()
            .map(|p| PermissionInfo {
                name: p.name,
                resource_type: format!("{:?}", p.resource_type),
                action: format!("{:?}", p.action),
                description: p.description,
            })
            .collect();

        Ok(CurrentUser {
            id: UserId(user.id),
            email: user.email,
            first_name: user_profile.as_ref().and_then(|p| p.first_name.clone()),
            last_name: user_profile.as_ref().and_then(|p| p.last_name.clone()),
            avatar_url: user_profile.as_ref().and_then(|p| p.avatar_url.clone()),
            is_active: user.is_active,
            roles: roles_info,
            permissions: permissions_info,
        })
    }
}

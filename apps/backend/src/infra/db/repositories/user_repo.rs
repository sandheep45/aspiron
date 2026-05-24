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

use crate::application::users::ports::UserRepository as UserDomainRepository;
use crate::domain::users::entities::{
    Permission as DomainPermission, Role as DomainRole, User as DomainUser,
    UserProfile as DomainUserProfile,
};

pub struct SeaOrmUserDomainRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmUserDomainRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl UserDomainRepository for SeaOrmUserDomainRepository {
    async fn get_user_by_email(&self, email: &str) -> Result<DomainUser, AppError> {
        let user = UserEntity::find()
            .filter(crate::entries::entities::user::Column::Email.eq(email))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("User not found"))?;

        Ok(DomainUser {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at.into(),
            updated_at: user.updated_at.into(),
        })
    }

    async fn get_user_profile_by_id(
        &self,
        user_id: Uuid,
    ) -> Result<(DomainUserProfile, Vec<DomainRole>, Vec<DomainPermission>), AppError> {
        let user = UserEntity::find_by_id(user_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("User not found"))?;

        let user_profile = UserProfileEntity::find_by_id(user_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let user_roles = crate::entries::entities::user_role::Entity::find()
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

        let profile = DomainUserProfile {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            first_name: user_profile.as_ref().and_then(|p| p.first_name.clone()),
            last_name: user_profile.as_ref().and_then(|p| p.last_name.clone()),
            avatar_url: user_profile.as_ref().and_then(|p| p.avatar_url.clone()),
            created_at: user.created_at.into(),
            updated_at: user.updated_at.into(),
        };

        let domain_roles: Vec<DomainRole> = roles
            .into_iter()
            .map(|r| DomainRole {
                id: r.id,
                name: format!("{:?}", r.name),
                display_name: r.display_name,
                description: r.description,
                is_system_role: r.is_system_role,
                created_at: r.created_at.into(),
                updated_at: r.updated_at.into(),
            })
            .collect();

        let domain_permissions: Vec<DomainPermission> = permissions
            .into_iter()
            .map(|p| DomainPermission {
                id: p.id,
                name: p.name,
                resource_type: p.resource_type.to_string(),
                action: p.action.to_string(),
                description: p.description,
                created_at: p.created_at.into(),
                updated_at: p.updated_at.into(),
            })
            .collect();

        Ok((profile, domain_roles, domain_permissions))
    }

    async fn get_resource_permissions_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<DomainPermission>, AppError> {
        let (_, _, permissions) = self.get_user_profile_by_id(user_id).await?;
        Ok(permissions)
    }
}

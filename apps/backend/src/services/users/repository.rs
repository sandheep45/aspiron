use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::users::*;
use crate::entries::entities::permission::Entity as PermissionEntity;
use crate::entries::entities::role::Entity as RoleEntity;
use crate::entries::entities::role_permission::Entity as RolePermissionEntity;
use crate::entries::entities::user::Entity as UserEntity;
use crate::entries::entities::user_profile::Entity as UserProfileEntity;
use crate::entries::entities::user_role::Entity as UserRoleEntity;
use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct UserRepository {
    db: Arc<DatabaseConnection>,
}

impl UserRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_user_entity_by_email(
        &self,
        email: &str,
    ) -> Result<<UserEntity as sea_orm::EntityTrait>::Model, AppError> {
        let user = UserEntity::find()
            .filter(crate::entries::entities::user::Column::Email.eq(email))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::auth("Invalid credentials"))?;

        Ok(user)
    }

    pub async fn get_user_by_email(&self, email: &str) -> Result<UserResponse, AppError> {
        let user = UserEntity::find()
            .filter(crate::entries::entities::user::Column::Email.eq(email))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("User not found"))?;

        Ok(UserResponse {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        })
    }

    pub async fn get_user_profile_by_id(
        &self,
        user_id: Uuid,
    ) -> Result<UserProfileResponse, AppError> {
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

        // Convert to response DTOs
        let user_response = UserResponse {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        let roles_response: Vec<RoleResponse> = roles
            .into_iter()
            .map(|role| RoleResponse {
                id: role.id,
                name: role.name,
                display_name: role.display_name,
                description: role.description,
                is_system_role: role.is_system_role,
                created_at: role.created_at,
                updated_at: role.updated_at,
            })
            .collect();

        let permissions_response: Vec<PermissionResponse> = permissions
            .into_iter()
            .map(|permission| PermissionResponse {
                id: permission.id,
                name: permission.name,
                resource_type: permission.resource_type,
                action: permission.action,
                description: permission.description,
                created_at: permission.created_at,
                updated_at: permission.updated_at,
            })
            .collect();

        let resource_permissions = self
            .extract_resource_permissions(&permissions_response)
            .await?;

        let profile = user_profile.map(|p| UserProfileDataResponse {
            first_name: p.first_name,
            last_name: p.last_name,
            avatar_url: p.avatar_url,
        });

        Ok(UserProfileResponse {
            user: user_response,
            profile: profile.unwrap_or(UserProfileDataResponse {
                first_name: None,
                last_name: None,
                avatar_url: None,
            }),
            roles: roles_response,
            permissions: permissions_response,
            resource_permissions,
        })
    }

    pub async fn get_resource_permissions_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<ResourcePermissionResponse>, AppError> {
        let user_profile = self.get_user_profile_by_id(user_id).await?;
        Ok(user_profile.resource_permissions)
    }

    async fn extract_resource_permissions(
        &self,
        permissions: &[PermissionResponse],
    ) -> Result<Vec<ResourcePermissionResponse>, AppError> {
        let mut resource_permissions = Vec::new();

        for permission in permissions {
            if let Some((resource_type, action, ownership)) =
                UserRepository::parse_permission_name(&permission.name)
            {
                resource_permissions.push(ResourcePermissionResponse {
                    resource_type,
                    action,
                    ownership,
                    resource_id: None, // Can be set if specific resource instance is needed
                });
            }
        }

        Ok(resource_permissions)
    }

    pub fn parse_permission_name(
        permission_name: &str,
    ) -> Option<(ResourceTypeEnum, ActionTypeEnum, OwnershipType)> {
        super::utils::permission::parse_permission_name(permission_name)
    }

    pub async fn has_permission(
        &self,
        user_id: Uuid,
        resource_type: ResourceTypeEnum,
        action: ActionTypeEnum,
    ) -> Result<bool, AppError> {
        let permissions = self.get_resource_permissions_by_user_id(user_id).await?;

        for permission in permissions {
            if permission.resource_type == resource_type && permission.action == action {
                return Ok(true);
            }
        }

        Ok(false)
    }

    pub async fn has_resource_permission(
        &self,
        user_id: Uuid,
        resource_type: ResourceTypeEnum,
        action: ActionTypeEnum,
        ownership: OwnershipType,
    ) -> Result<bool, AppError> {
        let permissions = self.get_resource_permissions_by_user_id(user_id).await?;

        for permission in permissions {
            if permission.resource_type == resource_type
                && permission.action == action
                && permission.ownership == ownership
            {
                return Ok(true);
            }
        }

        Ok(false)
    }
}

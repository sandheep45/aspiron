use std::sync::Arc;

use uuid::Uuid;

use super::permission::{
    parse_action_type_result, parse_ownership_type_result, parse_permission_name,
    parse_resource_type_result,
};
use super::ports::UserRepository;
use crate::http::responses::users::*;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct UserService {
    repo: Arc<dyn UserRepository>,
}

impl UserService {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self { repo }
    }

    pub async fn get_user_by_email(&self, email: &str) -> Result<UserResponse, AppError> {
        let user = self.repo.get_user_by_email(email).await?;
        Ok(UserResponse {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            created_at: user.created_at.into(),
            updated_at: user.updated_at.into(),
        })
    }

    pub async fn get_user_profile_by_id(
        &self,
        user_id: Uuid,
    ) -> Result<UserProfileResponse, AppError> {
        let (profile, roles, permissions) = self.repo.get_user_profile_by_id(user_id).await?;

        let user_response = UserResponse {
            id: profile.id,
            email: profile.email,
            is_active: profile.is_active,
            created_at: profile.created_at.into(),
            updated_at: profile.updated_at.into(),
        };

        let roles_response: Vec<RoleResponse> = roles
            .into_iter()
            .map(|r| {
                let role_name = parse_user_type(&r.name);
                RoleResponse {
                    id: r.id,
                    name: role_name,
                    display_name: r.display_name,
                    description: r.description,
                    is_system_role: r.is_system_role,
                    created_at: r.created_at.into(),
                    updated_at: r.updated_at.into(),
                }
            })
            .collect();

        let permissions_response: Vec<PermissionResponse> = permissions
            .iter()
            .map(|p| {
                let resource_type = parse_resource_type_result(&p.resource_type).unwrap_or(
                    crate::entries::entity_enums::resource_types::ResourceTypeEnum::SYSTEM,
                );
                let action = parse_action_type_result(&p.action)
                    .unwrap_or(crate::entries::entity_enums::action_types::ActionTypeEnum::READ);
                PermissionResponse {
                    id: p.id,
                    name: p.name.clone(),
                    resource_type,
                    action,
                    description: p.description.clone(),
                    created_at: p.created_at.into(),
                    updated_at: p.updated_at.into(),
                }
            })
            .collect();

        let resource_permissions = extract_resource_permissions(&permissions_response);

        let profile_data = UserProfileDataResponse {
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
        };

        Ok(UserProfileResponse {
            user: user_response,
            profile: profile_data,
            roles: roles_response,
            permissions: permissions_response,
            resource_permissions,
        })
    }

    pub async fn get_resource_permissions_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<ResourcePermissionResponse>, AppError> {
        let permissions = self
            .repo
            .get_resource_permissions_by_user_id(user_id)
            .await?;
        let perm_responses: Vec<PermissionResponse> = permissions
            .iter()
            .map(|p| {
                let resource_type = parse_resource_type_result(&p.resource_type).unwrap_or(
                    crate::entries::entity_enums::resource_types::ResourceTypeEnum::SYSTEM,
                );
                let action = parse_action_type_result(&p.action)
                    .unwrap_or(crate::entries::entity_enums::action_types::ActionTypeEnum::READ);
                PermissionResponse {
                    id: p.id,
                    name: p.name.clone(),
                    resource_type,
                    action,
                    description: p.description.clone(),
                    created_at: p.created_at.into(),
                    updated_at: p.updated_at.into(),
                }
            })
            .collect();

        Ok(extract_resource_permissions(&perm_responses))
    }

    pub async fn has_permission(
        &self,
        user_id: Uuid,
        resource_type: String,
        action: String,
    ) -> Result<bool, AppError> {
        parse_resource_type_result(&resource_type)?;
        parse_action_type_result(&action)?;
        let permissions = self
            .repo
            .get_resource_permissions_by_user_id(user_id)
            .await?;

        Ok(permissions
            .iter()
            .any(|p| p.resource_type == resource_type && p.action == action))
    }

    pub async fn has_resource_permission(
        &self,
        user_id: Uuid,
        resource_type: String,
        action: String,
        ownership: String,
    ) -> Result<bool, AppError> {
        let _resource_type = parse_resource_type_result(&resource_type)?;
        let _action = parse_action_type_result(&action)?;
        let _ownership_type = parse_ownership_type_result(&ownership)?;
        let permissions = self
            .repo
            .get_resource_permissions_by_user_id(user_id)
            .await?;

        for permission in &permissions {
            let perm_name = format!("{}.{}", resource_type, action);
            let ownership_check = format!("{}.{}.{}", resource_type, action, ownership);
            if permission.name == perm_name || permission.name == ownership_check {
                return Ok(true);
            }
        }

        Ok(false)
    }

    pub async fn get_permission_summary(
        &self,
        user_id: Uuid,
    ) -> Result<PermissionSummaryResponse, AppError> {
        let profile = self.get_user_profile_by_id(user_id).await?;

        let permissions: Vec<String> = profile.permissions.iter().map(|p| p.name.clone()).collect();

        Ok(PermissionSummaryResponse {
            user_id,
            has_permission: !permissions.is_empty(),
            permissions,
            resource_permissions: profile.resource_permissions,
        })
    }
}

fn parse_user_type(s: &str) -> crate::entries::entity_enums::user_types::UserTypeEnums {
    match s {
        "STUDENT" => crate::entries::entity_enums::user_types::UserTypeEnums::STUDENT,
        "TEACHER" => crate::entries::entity_enums::user_types::UserTypeEnums::TEACHER,
        "ADMIN" => crate::entries::entity_enums::user_types::UserTypeEnums::ADMIN,
        _ => crate::entries::entity_enums::user_types::UserTypeEnums::STUDENT,
    }
}

fn extract_resource_permissions(
    permissions: &[PermissionResponse],
) -> Vec<ResourcePermissionResponse> {
    let mut resource_permissions = Vec::new();

    for permission in permissions {
        if let Some((resource_type, action, ownership)) = parse_permission_name(&permission.name) {
            resource_permissions.push(ResourcePermissionResponse {
                resource_type,
                action,
                ownership,
                resource_id: None,
            });
        }
    }

    resource_permissions
}

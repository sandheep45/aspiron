use axum::Json;
use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::entries::action_types::ActionTypeEnum;
use crate::entries::dtos::response::users::*;
use crate::entries::resource_types::ResourceTypeEnum;
use crate::setup::error::AppError;

pub struct UserService {
    repository: super::repository::UserRepository,
}

impl UserService {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            repository: super::repository::UserRepository::new(db),
        }
    }

    pub async fn get_user_by_email(&self, email: &str) -> Result<Json<UserResponse>, AppError> {
        let user = self.repository.get_user_by_email(email).await?;
        Ok(Json(user))
    }

    pub async fn get_user_profile_by_id(
        &self,
        user_id: Uuid,
    ) -> Result<Json<UserProfileResponse>, AppError> {
        let profile = self.repository.get_user_profile_by_id(user_id).await?;
        Ok(Json(profile))
    }

    pub async fn get_resource_permissions_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Json<Vec<ResourcePermissionResponse>>, AppError> {
        let permissions = self
            .repository
            .get_resource_permissions_by_user_id(user_id)
            .await?;
        Ok(Json(permissions))
    }

    pub async fn has_permission(
        &self,
        user_id: Uuid,
        resource_type: String,
        action: String,
    ) -> Result<Json<bool>, AppError> {
        let resource_type = self.parse_resource_type(&resource_type)?;
        let action = self.parse_action_type(&action)?;

        let has_perm = self
            .repository
            .has_permission(user_id, resource_type, action)
            .await?;
        Ok(Json(has_perm))
    }

    pub async fn has_resource_permission(
        &self,
        user_id: Uuid,
        resource_type: String,
        action: String,
        ownership: String,
    ) -> Result<Json<bool>, AppError> {
        let resource_type = self.parse_resource_type(&resource_type)?;
        let action = self.parse_action_type(&action)?;
        let ownership = self.parse_ownership_type(&ownership)?;

        let has_perm = self
            .repository
            .has_resource_permission(user_id, resource_type, action, ownership)
            .await?;
        Ok(Json(has_perm))
    }

    fn parse_resource_type(&self, resource_type: &str) -> Result<ResourceTypeEnum, AppError> {
        match resource_type.to_uppercase().as_str() {
            "USER" => Ok(ResourceTypeEnum::USER),
            "CONTENT" => Ok(ResourceTypeEnum::CONTENT),
            "ASSESSMENT" => Ok(ResourceTypeEnum::ASSESSMENT),
            "COMMUNITY" => Ok(ResourceTypeEnum::COMMUNITY),
            "SYSTEM" => Ok(ResourceTypeEnum::SYSTEM),
            "SUBJECT" => Ok(ResourceTypeEnum::SUBJECT),
            "CHAPTER" => Ok(ResourceTypeEnum::CHAPTER),
            "TOPIC" => Ok(ResourceTypeEnum::TOPIC),
            "VIDEO" => Ok(ResourceTypeEnum::VIDEO),
            "QUIZ" => Ok(ResourceTypeEnum::QUIZ),
            "QUESTION" => Ok(ResourceTypeEnum::QUESTION),
            "THREAD" => Ok(ResourceTypeEnum::THREAD),
            "POST" => Ok(ResourceTypeEnum::POST),
            "NOTE" => Ok(ResourceTypeEnum::NOTE),
            _ => Err(AppError::validation("Invalid resource type")),
        }
    }

    fn parse_action_type(&self, action: &str) -> Result<ActionTypeEnum, AppError> {
        match action.to_uppercase().as_str() {
            "CREATE" => Ok(ActionTypeEnum::CREATE),
            "READ" => Ok(ActionTypeEnum::READ),
            "UPDATE" => Ok(ActionTypeEnum::UPDATE),
            "DELETE" => Ok(ActionTypeEnum::DELETE),
            "MANAGE" => Ok(ActionTypeEnum::MANAGE),
            "PUBLISH" => Ok(ActionTypeEnum::PUBLISH),
            "MODERATE" => Ok(ActionTypeEnum::MODERATE),
            "GRADE" => Ok(ActionTypeEnum::GRADE),
            "TAKE" => Ok(ActionTypeEnum::TAKE),
            "VIEW_RESULTS" => Ok(ActionTypeEnum::ViewResults),
            "VIEW_ANY_RESULTS" => Ok(ActionTypeEnum::ViewAnyResults),
            "ASSIGN_ROLES" => Ok(ActionTypeEnum::AssignRoles),
            "VIEW_ANALYTICS" => Ok(ActionTypeEnum::ViewAnalytics),
            "MANAGE_SETTINGS" => Ok(ActionTypeEnum::ManageSettings),
            "AUDIT" => Ok(ActionTypeEnum::AUDIT),
            _ => Err(AppError::validation("Invalid action type")),
        }
    }

    fn parse_ownership_type(&self, ownership: &str) -> Result<OwnershipType, AppError> {
        match ownership.to_lowercase().as_str() {
            "own" => Ok(OwnershipType::Own),
            "all" => Ok(OwnershipType::All),
            _ => Err(AppError::validation("Invalid ownership type")),
        }
    }

    pub async fn get_permission_summary(
        &self,
        user_id: Uuid,
    ) -> Result<Json<PermissionSummaryResponse>, AppError> {
        let profile = self.repository.get_user_profile_by_id(user_id).await?;

        let permissions: Vec<String> = profile
            .permissions
            .iter()
            .map(|permission: &PermissionResponse| permission.name.clone())
            .collect();

        let summary = PermissionSummaryResponse {
            user_id,
            has_permission: !permissions.is_empty(),
            permissions,
            resource_permissions: profile.resource_permissions,
        };

        Ok(Json(summary))
    }
}

impl From<PermissionResponse> for String {
    fn from(permission: PermissionResponse) -> Self {
        permission.name.clone()
    }
}

impl From<ResourcePermissionResponse> for String {
    fn from(permission: ResourcePermissionResponse) -> Self {
        format!(
            "{}.{}.{}",
            permission.resource_type, permission.action, permission.ownership
        )
    }
}

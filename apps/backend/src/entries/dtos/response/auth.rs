use crate::entries::dtos::response::users::{PermissionResponse, RoleResponse, UserResponse};
use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::entries::entity_enums::user_types::UserTypeEnums;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AuthResponse")]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub user: AuthUserResponse,
    pub roles: Vec<AuthRoleResponse>,
    pub permissions: Vec<AuthPermissionResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AuthUserResponse")]
pub struct AuthUserResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub is_active: bool,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    #[schema(value_type = String)]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AuthRoleResponse")]
pub struct AuthRoleResponse {
    pub name: UserTypeEnums,
    pub display_name: String,
    pub description: Option<String>,
    pub is_system_role: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "AuthPermissionResponse")]
pub struct AuthPermissionResponse {
    pub name: String,
    pub resource_type: ResourceTypeEnum,
    pub action: ActionTypeEnum,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "TokenResponse")]
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "MeResponse")]
pub struct MeResponse {
    pub user: UserResponse,
    pub roles: Vec<RoleResponse>,
    pub permissions: Vec<PermissionResponse>,
}

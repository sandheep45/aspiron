use crate::entries::entitiy_enums::action_types::ActionTypeEnum;
use crate::entries::entitiy_enums::resource_types::ResourceTypeEnum;
use crate::entries::entitiy_enums::user_types::UserTypeEnums;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "AuthResponse")]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub user: UserResponse,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "TokenResponse")]
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: String,
    pub expires_in: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "UserResponse")]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub is_active: bool,
    #[ts(type = "Date")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "MeResponse")]
pub struct MeResponse {
    pub user: UserResponse,
    pub roles: Vec<RoleResponse>,
    pub permissions: Vec<PermissionResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RoleResponse")]
pub struct RoleResponse {
    pub id: Uuid,
    pub name: UserTypeEnums,
    pub display_name: String,
    pub description: Option<String>,
    pub is_system_role: bool,
    #[ts(type = "Date")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "PermissionResponse")]
pub struct PermissionResponse {
    pub id: Uuid,
    pub name: String,
    pub resource_type: ResourceTypeEnum,
    pub action: ActionTypeEnum,
    pub description: Option<String>,
    #[ts(type = "Date")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "Date")]
    pub updated_at: DateTimeWithTimeZone,
}

use std::fmt;

use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::entries::entity_enums::user_types::UserTypeEnums;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "UserProfileResponse")]
pub struct UserProfileResponse {
    pub user: UserResponse,
    pub profile: UserProfileDataResponse,
    pub roles: Vec<RoleResponse>,
    pub permissions: Vec<PermissionResponse>,
    pub resource_permissions: Vec<ResourcePermissionResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "UserProfileDataResponse")]
pub struct UserProfileDataResponse {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
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

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "ResourcePermissionResponse")]
pub struct ResourcePermissionResponse {
    pub resource_type: ResourceTypeEnum,
    pub action: ActionTypeEnum,
    pub ownership: OwnershipType,
    pub resource_id: Option<Uuid>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, rename = "OwnershipType")]
pub enum OwnershipType {
    #[ts(rename = "OWN")]
    Own,
    #[ts(rename = "ALL")]
    All,
}

impl fmt::Display for OwnershipType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OwnershipType::Own => write!(f, "OWN"),
            OwnershipType::All => write!(f, "ALL"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "UserPermissionResponse")]
pub struct UserPermissionResponse {
    pub rbac_permissions: Vec<PermissionResponse>,
    pub acl_permissions: Vec<ResourcePermissionResponse>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "PermissionSummaryResponse")]
pub struct PermissionSummaryResponse {
    pub user_id: Uuid,
    pub has_permission: bool,
    pub permissions: Vec<String>,
    pub resource_permissions: Vec<ResourcePermissionResponse>,
}

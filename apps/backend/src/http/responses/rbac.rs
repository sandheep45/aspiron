use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RoleResponse")]
pub struct RoleResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub is_system_role: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "PermissionResponse")]
pub struct PermissionResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    pub name: String,
    pub resource_type: String,
    pub action: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "UserRoleResponse")]
pub struct UserRoleResponse {
    #[schema(value_type = String)]
    pub id: Uuid,
    #[schema(value_type = String)]
    pub user_id: Uuid,
    #[schema(value_type = String)]
    pub role_id: Uuid,
    pub is_active: bool,
}

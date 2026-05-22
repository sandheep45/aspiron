use super::value_objects::{Email, UserId};

pub struct User {
    pub id: UserId,
    pub email: Email,
    pub password_hash: String,
    pub is_active: bool,
}

pub struct CurrentUser {
    pub id: UserId,
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub is_active: bool,
    pub roles: Vec<RoleInfo>,
    pub permissions: Vec<PermissionInfo>,
}

pub struct RoleInfo {
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub is_system_role: bool,
}

pub struct PermissionInfo {
    pub name: String,
    pub resource_type: String,
    pub action: String,
    pub description: Option<String>,
}

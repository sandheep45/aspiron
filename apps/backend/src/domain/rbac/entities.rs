use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub is_system_role: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct Permission {
    pub id: Uuid,
    pub name: String,
    pub resource_type: String,
    pub action: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone)]
pub struct UserRole {
    pub id: Uuid,
    pub user_id: Uuid,
    pub role_id: Uuid,
    pub is_active: bool,
    pub assigned_at: DateTime<Utc>,
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct RolePermission {
    pub id: Uuid,
    pub role_id: Uuid,
    pub permission_id: Uuid,
}

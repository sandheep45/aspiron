use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::rbac::entities::{Permission, Role, RolePermission, UserRole};
use crate::setup::error::AppError;

#[async_trait]
pub trait RbacRepository: Send + Sync {
    async fn get_all_roles(&self) -> Result<Vec<Role>, AppError>;
    async fn get_role_by_id(&self, role_id: Uuid) -> Result<Role, AppError>;
    async fn create_role(
        &self,
        name: String,
        display_name: String,
        description: Option<String>,
    ) -> Result<Role, AppError>;
    async fn assign_permission_to_role(
        &self,
        role_id: Uuid,
        permission_id: Uuid,
    ) -> Result<RolePermission, AppError>;
    async fn get_user_roles(&self, user_id: Uuid) -> Result<Vec<UserRole>, AppError>;
    async fn assign_role_to_user(
        &self,
        user_id: Uuid,
        role_id: Uuid,
        assigned_by: Option<Uuid>,
    ) -> Result<UserRole, AppError>;
    async fn remove_user_role(&self, user_role_id: Uuid) -> Result<(), AppError>;
    async fn get_permissions_for_role(&self, role_id: Uuid) -> Result<Vec<Permission>, AppError>;
    async fn get_all_permissions(&self) -> Result<Vec<Permission>, AppError>;
}

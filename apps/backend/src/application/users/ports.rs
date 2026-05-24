use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::users::entities::{Permission, Role, UserProfile};
use crate::setup::error::AppError;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn get_user_by_email(
        &self,
        email: &str,
    ) -> Result<crate::domain::users::entities::User, AppError>;
    async fn get_user_profile_by_id(
        &self,
        user_id: Uuid,
    ) -> Result<(UserProfile, Vec<Role>, Vec<Permission>), AppError>;
    async fn get_resource_permissions_by_user_id(
        &self,
        user_id: Uuid,
    ) -> Result<Vec<Permission>, AppError>;
}

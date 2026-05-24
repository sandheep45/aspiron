use async_trait::async_trait;
use uuid::Uuid;

use crate::application::insights::ports::AuthorizationPort;
use crate::application::users::service::UserService;
use crate::setup::error::AppError;

pub struct UserServiceAuthAdapter {
    inner: UserService,
}

impl UserServiceAuthAdapter {
    pub fn new(inner: UserService) -> Self {
        Self { inner }
    }
}

#[async_trait]
impl AuthorizationPort for UserServiceAuthAdapter {
    async fn has_permission(
        &self,
        user_id: Uuid,
        resource_type: String,
        action: String,
    ) -> Result<bool, AppError> {
        self.inner
            .has_permission(user_id, resource_type, action)
            .await
    }
}

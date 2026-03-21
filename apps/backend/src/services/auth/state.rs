use std::sync::Arc;

use crate::services::auth::service::AuthService;

#[derive(Clone)]
pub struct AuthState {
    pub auth_service: AuthService,
}

impl AuthState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            auth_service: AuthService::new(db),
        }
    }
}

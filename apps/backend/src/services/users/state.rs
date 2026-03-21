use std::sync::Arc;

use crate::services::users::service::UserService;

#[derive(Clone)]
pub struct UsersState {
    pub user_service: UserService,
}

impl UsersState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            user_service: UserService::new(db),
        }
    }
}

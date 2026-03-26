use std::sync::Arc;

use crate::services::insights::service::InsightsService;
use crate::services::users::service::UserService;

pub mod handler;
pub mod repository;
pub mod service;

#[derive(Clone)]
pub struct InsightsState {
    pub insights_service: InsightsService,
    pub user_service: UserService,
}

impl InsightsState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            insights_service: InsightsService::new(db.clone()),
            user_service: UserService::new(db),
        }
    }
}

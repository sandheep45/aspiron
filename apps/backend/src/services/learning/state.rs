use std::sync::Arc;

use crate::services::learning::service::LearningService;

#[derive(Clone)]
pub struct LearningState {
    pub learning_service: LearningService,
}

impl LearningState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            learning_service: LearningService::new(db),
        }
    }
}

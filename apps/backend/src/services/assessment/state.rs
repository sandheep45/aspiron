use std::sync::Arc;

use crate::services::assessment::service::AssessmentService;

#[derive(Clone)]
pub struct AssessmentState {
    pub assessment_service: AssessmentService,
}

impl AssessmentState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            assessment_service: AssessmentService::new(db),
        }
    }
}

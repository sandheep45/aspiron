use std::sync::Arc;

use crate::services::community::service::CommunityService;

#[derive(Clone)]
pub struct CommunityState {
    pub community_service: CommunityService,
}

impl CommunityState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            community_service: CommunityService::new(db),
        }
    }
}

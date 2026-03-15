use std::sync::Arc;

use crate::services::live_session::service::LiveSessionService;

#[derive(Clone)]
pub struct LiveSessionState {
    pub live_session_service: LiveSessionService,
}

impl LiveSessionState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            live_session_service: LiveSessionService::new(db),
        }
    }
}

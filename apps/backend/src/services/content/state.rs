use std::sync::Arc;

use crate::services::content::{service::ContentService, topic::service::TopicService};

#[derive(Clone)]
pub struct ContentState {
    pub content_service: ContentService,
    pub topic_service: TopicService,
}

impl ContentState {
    pub fn new(db: Arc<sea_orm::DatabaseConnection>) -> Self {
        Self {
            content_service: ContentService::new(db.clone()),
            topic_service: TopicService::new(db.clone()),
        }
    }
}

use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::{
    entries::dtos::response::content::TopicDto,
    services::content::topic::repository::TopicRepository, setup::error::AppError,
};

#[derive(Clone)]
pub struct TopicService {
    repository: TopicRepository,
}

impl TopicService {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self {
            repository: TopicRepository::new(db),
        }
    }

    pub async fn get_topic_by_id(&self, topic_id: Uuid) -> Result<TopicDto, AppError> {
        self.repository.get_topic_by_id(topic_id).await
    }
}

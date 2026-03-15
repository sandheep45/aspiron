use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::entities::content_topic::Entity as ContentTopicEntity;

use crate::entries::dtos::response::content::TopicDto;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct TopicRepository {
    db: Arc<DatabaseConnection>,
}

impl TopicRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_topic_by_id(&self, topic_id: Uuid) -> Result<TopicDto, AppError> {
        let topic = ContentTopicEntity::find()
            .filter(crate::entries::entities::content_topic::Column::Id.eq(topic_id))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Invalid Topic ID"))?;

        Ok(TopicDto {
            chapter_id: topic.chapter_id,
            id: topic.id,
            name: topic.name,
            order_number: topic.order_number,
        })
    }
}

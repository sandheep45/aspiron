use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::community::{CommunityPostResponse, CommunityThreadResponse};
use crate::entries::entities::community_thread::Entity as CommunityThreadEntity;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct CommunityRepository {
    db: Arc<DatabaseConnection>,
}

impl CommunityRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn create_thread(
        &self,
        _user_id: Uuid,
        _title: String,
        _content: String,
        _topic_id: Uuid,
    ) -> Result<CommunityThreadResponse, AppError> {
        todo!()
    }

    pub async fn get_threads_by_topic(
        &self,
        topic_id: Uuid,
    ) -> Result<Vec<CommunityThreadResponse>, AppError> {
        let threads = CommunityThreadEntity::find()
            .filter(crate::entries::entities::community_thread::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(threads
            .into_iter()
            .map(|t| CommunityThreadResponse {
                id: t.id,
                user_id: t.user_id,
                title: t.title,
                topic_id: t.topic_id,
            })
            .collect())
    }

    pub async fn get_thread_by_id(
        &self,
        _thread_id: Uuid,
    ) -> Result<CommunityThreadResponse, AppError> {
        todo!()
    }

    pub async fn create_post(
        &self,
        _user_id: Uuid,
        _thread_id: Uuid,
        _content: String,
    ) -> Result<CommunityPostResponse, AppError> {
        todo!()
    }

    pub async fn attach_note(
        &self,
        _thread_id: Uuid,
        _note_id: Uuid,
    ) -> Result<CommunityThreadResponse, AppError> {
        todo!()
    }
}

use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::application::community::ports::CommunityRepository;
use crate::domain::community::entities::{Post, Thread};
use crate::entries::entities::community_thread;
use crate::setup::error::AppError;

pub struct SeaOrmCommunityRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmCommunityRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl CommunityRepository for SeaOrmCommunityRepository {
    async fn create_thread(
        &self,
        _user_id: Uuid,
        _title: String,
        _content: String,
        _topic_id: Uuid,
    ) -> Result<Thread, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: create_thread"
        )))
    }

    async fn get_threads_by_topic(&self, topic_id: Uuid) -> Result<Vec<Thread>, AppError> {
        let threads = community_thread::Entity::find()
            .filter(community_thread::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(threads.into_iter().map(map_thread_orm_to_domain).collect())
    }

    async fn get_thread_by_id(&self, _thread_id: Uuid) -> Result<Thread, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: get_thread_by_id"
        )))
    }

    async fn create_post(
        &self,
        _user_id: Uuid,
        _thread_id: Uuid,
        _content: String,
    ) -> Result<Post, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: create_post"
        )))
    }

    async fn attach_note(&self, _thread_id: Uuid, _note_id: Uuid) -> Result<Thread, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: attach_note"
        )))
    }
}

fn map_thread_orm_to_domain(t: community_thread::Model) -> Thread {
    Thread {
        id: t.id,
        user_id: t.user_id,
        topic_id: t.topic_id,
        title: t.title,
        created_at: t.created_at.into(),
    }
}

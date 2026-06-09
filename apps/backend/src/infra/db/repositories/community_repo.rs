use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::application::community::ports::CommunityRepository;
use crate::domain::community::entities::{Post, Thread};
use crate::entries::entities::{community_post, community_thread};
use crate::setup::error::AppError;

pub(crate) struct SeaOrmCommunityRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmCommunityRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl CommunityRepository for SeaOrmCommunityRepository {
    async fn create_thread(
        &self,
        user_id: Uuid,
        title: String,
        _content: String,
        topic_id: Uuid,
    ) -> Result<Thread, AppError> {
        let active = community_thread::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            topic_id: Set(topic_id),
            title: Set(title),
            created_at: Set(chrono::Utc::now().into()),
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_thread_active_to_domain(result))
    }

    async fn get_threads_by_topic(&self, topic_id: Uuid) -> Result<Vec<Thread>, AppError> {
        let threads = community_thread::Entity::find()
            .filter(community_thread::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(threads.into_iter().map(map_thread_orm_to_domain).collect())
    }

    async fn get_thread_by_id(&self, thread_id: Uuid) -> Result<Thread, AppError> {
        let orm = community_thread::Entity::find_by_id(thread_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Thread not found"))?;

        Ok(map_thread_orm_to_domain(orm))
    }

    async fn create_post(
        &self,
        user_id: Uuid,
        thread_id: Uuid,
        content: String,
    ) -> Result<Post, AppError> {
        let active = community_post::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            thread_id: Set(thread_id),
            content: Set(content),
            created_at: Set(chrono::Utc::now().into()),
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_post_active_to_domain(result))
    }

    async fn attach_note(&self, _thread_id: Uuid, _note_id: Uuid) -> Result<Thread, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: attach_note — requires learning_notes to community_thread link table which does not exist"
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

fn map_thread_active_to_domain(t: community_thread::ActiveModel) -> Thread {
    Thread {
        id: t.id.clone().unwrap(),
        user_id: t.user_id.clone().unwrap(),
        topic_id: t.topic_id.clone().unwrap(),
        title: t.title.clone().unwrap(),
        created_at: t.created_at.clone().unwrap().into(),
    }
}

fn map_post_active_to_domain(p: community_post::ActiveModel) -> Post {
    Post {
        id: p.id.clone().unwrap(),
        user_id: p.user_id.clone().unwrap(),
        thread_id: p.thread_id.clone().unwrap(),
        content: p.content.clone().unwrap(),
        created_at: p.created_at.clone().unwrap().into(),
    }
}

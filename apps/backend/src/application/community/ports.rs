use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::community::entities::{Post, Thread};
use crate::setup::error::AppError;

#[async_trait]
pub trait CommunityRepository: Send + Sync {
    async fn create_thread(
        &self,
        user_id: Uuid,
        title: String,
        content: String,
        topic_id: Uuid,
    ) -> Result<Thread, AppError>;
    async fn get_threads_by_topic(&self, topic_id: Uuid) -> Result<Vec<Thread>, AppError>;
    async fn get_thread_by_id(&self, thread_id: Uuid) -> Result<Thread, AppError>;
    async fn create_post(
        &self,
        user_id: Uuid,
        thread_id: Uuid,
        content: String,
    ) -> Result<Post, AppError>;
    async fn attach_note(&self, thread_id: Uuid, note_id: Uuid) -> Result<Thread, AppError>;
}

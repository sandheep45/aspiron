use uuid::Uuid;

use super::ports::ContentRepository;
use crate::domain::content::entities::Topic;
use crate::setup::error::AppError;

pub async fn execute_get_topic(
    repo: &dyn ContentRepository,
    topic_id: Uuid,
) -> Result<Topic, AppError> {
    repo.get_topic_by_id(topic_id).await
}

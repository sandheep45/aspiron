use uuid::Uuid;

use super::ports::ContentRepository;
use crate::domain::content::entities::Video;
use crate::setup::error::AppError;

pub async fn execute_get_videos(
    repo: &dyn ContentRepository,
    topic_id: Uuid,
) -> Result<Vec<Video>, AppError> {
    repo.get_videos_by_topic(topic_id).await
}

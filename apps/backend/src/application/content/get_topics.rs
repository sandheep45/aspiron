use uuid::Uuid;

use super::ports::ContentRepository;
use crate::domain::content::entities::Topic;
use crate::setup::error::AppError;

pub async fn execute_get_topics(
    repo: &dyn ContentRepository,
    chapter_id: Uuid,
) -> Result<Vec<Topic>, AppError> {
    repo.get_topics_by_chapter(chapter_id).await
}

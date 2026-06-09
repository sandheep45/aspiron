use uuid::Uuid;

use super::ports::ContentRepository;
use super::topics_page_types::TopicWithMetrics;
use crate::setup::error::AppError;

pub async fn execute_get_topics_page_topics(
    repo: &dyn ContentRepository,
    chapter_id: Uuid,
) -> Result<Vec<TopicWithMetrics>, AppError> {
    repo.get_topics_with_metrics(chapter_id).await
}

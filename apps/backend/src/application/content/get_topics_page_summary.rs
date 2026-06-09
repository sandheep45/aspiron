use uuid::Uuid;

use super::ports::ContentRepository;
use super::topics_page_types::TopicSummaryData;
use crate::setup::error::AppError;

pub async fn execute_get_topics_page_summary(
    repo: &dyn ContentRepository,
    chapter_id: Uuid,
) -> Result<TopicSummaryData, AppError> {
    repo.get_topic_summary(chapter_id).await
}

use uuid::Uuid;

use super::ports::ContentRepository;
use super::topics_page_types::TopicInsightData;
use crate::setup::error::AppError;

pub async fn execute_get_topics_page_insights(
    repo: &dyn ContentRepository,
    chapter_id: Uuid,
) -> Result<Vec<TopicInsightData>, AppError> {
    repo.get_topic_insights(chapter_id).await
}

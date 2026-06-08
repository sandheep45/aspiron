use uuid::Uuid;

use super::chapters_page_types::ChapterInsightData;
use super::ports::ContentRepository;
use crate::setup::error::AppError;

pub async fn execute_get_chapters_page_insights(
    repo: &dyn ContentRepository,
    subject_id: Uuid,
) -> Result<Vec<ChapterInsightData>, AppError> {
    repo.get_chapter_insights(subject_id).await
}

use uuid::Uuid;

use super::chapters_page_types::ChapterSummaryData;
use super::ports::ContentRepository;
use crate::setup::error::AppError;

pub async fn execute_get_chapters_page_summary(
    repo: &dyn ContentRepository,
    subject_id: Uuid,
) -> Result<ChapterSummaryData, AppError> {
    repo.get_chapter_summary(subject_id).await
}

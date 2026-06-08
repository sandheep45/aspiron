use uuid::Uuid;

use super::chapters_page_types::ChapterWithMetrics;
use super::ports::ContentRepository;
use crate::setup::error::AppError;

pub async fn execute_get_chapters_page_chapters(
    repo: &dyn ContentRepository,
    subject_id: Uuid,
) -> Result<Vec<ChapterWithMetrics>, AppError> {
    repo.get_chapters_with_metrics(subject_id).await
}

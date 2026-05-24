use uuid::Uuid;

use super::ports::ContentRepository;
use crate::domain::content::entities::Chapter;
use crate::setup::error::AppError;

pub async fn execute_get_chapters(
    repo: &dyn ContentRepository,
    subject_id: Uuid,
) -> Result<Vec<Chapter>, AppError> {
    repo.get_chapters_by_subject(subject_id).await
}

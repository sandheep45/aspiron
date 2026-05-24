use uuid::Uuid;

use super::ports::LearningRepository;
use crate::setup::error::AppError;

pub async fn execute_delete_note(
    repo: &dyn LearningRepository,
    note_id: Uuid,
) -> Result<(), AppError> {
    repo.delete_note(note_id).await
}

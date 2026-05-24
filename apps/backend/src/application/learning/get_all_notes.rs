use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::Note;
use crate::setup::error::AppError;

pub async fn execute_get_all_notes(
    repo: &dyn LearningRepository,
    user_id: Uuid,
) -> Result<Vec<Note>, AppError> {
    repo.get_all_notes(user_id).await
}

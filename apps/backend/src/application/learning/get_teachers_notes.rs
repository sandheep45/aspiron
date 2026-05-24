use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::Note;
use crate::setup::error::AppError;

pub async fn execute_get_teachers_notes(
    repo: &dyn LearningRepository,
    topic_id: Uuid,
) -> Result<Vec<Note>, AppError> {
    repo.get_teachers_notes(topic_id).await
}

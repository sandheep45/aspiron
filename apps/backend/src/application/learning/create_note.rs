use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::Note;
use crate::setup::error::AppError;

pub async fn execute_create_note(
    repo: &dyn LearningRepository,
    user_id: Uuid,
    topic_id: Uuid,
    title: String,
    content: String,
) -> Result<Note, AppError> {
    repo.create_note(user_id, topic_id, title, content).await
}

use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::Note;
use crate::setup::error::AppError;

pub async fn execute_update_note(
    repo: &dyn LearningRepository,
    note_id: Uuid,
    title: Option<String>,
    content: Option<String>,
) -> Result<Note, AppError> {
    repo.update_note(note_id, title, content).await
}

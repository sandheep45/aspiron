use uuid::Uuid;

use super::ports::AssessmentRepository;
use crate::domain::assessment::entities::Quiz;
use crate::setup::error::AppError;

pub async fn execute_get_quiz(
    repo: &dyn AssessmentRepository,
    quiz_id: Uuid,
) -> Result<Quiz, AppError> {
    repo.get_quiz_by_id(quiz_id).await
}

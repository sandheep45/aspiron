use uuid::Uuid;

use super::ports::AssessmentRepository;
use crate::domain::assessment::entities::Question;
use crate::setup::error::AppError;

pub async fn execute_get_questions(
    repo: &dyn AssessmentRepository,
    quiz_id: Uuid,
) -> Result<Vec<Question>, AppError> {
    repo.get_questions_by_quiz(quiz_id).await
}

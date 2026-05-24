use uuid::Uuid;

use super::ports::AssessmentRepository;
use crate::domain::assessment::entities::Attempt;
use crate::setup::error::AppError;

pub async fn execute_create_attempt(
    repo: &dyn AssessmentRepository,
    user_id: Uuid,
    quiz_id: Uuid,
) -> Result<Attempt, AppError> {
    repo.create_attempt(user_id, quiz_id).await
}

use uuid::Uuid;

use super::ports::AssessmentRepository;
use crate::domain::assessment::entities::Attempt;
use crate::setup::error::AppError;

pub async fn execute_get_attempt_results(
    repo: &dyn AssessmentRepository,
    attempt_id: Uuid,
) -> Result<Attempt, AppError> {
    repo.get_attempt_results(attempt_id).await
}

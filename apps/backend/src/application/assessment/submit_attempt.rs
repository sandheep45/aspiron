use uuid::Uuid;

use super::ports::AssessmentRepository;
use crate::domain::assessment::entities::Attempt;
use crate::setup::error::AppError;

pub async fn execute_submit_attempt(
    repo: &dyn AssessmentRepository,
    attempt_id: Uuid,
    answers: Vec<(Uuid, String)>,
) -> Result<Attempt, AppError> {
    repo.submit_attempt(attempt_id, answers).await
}

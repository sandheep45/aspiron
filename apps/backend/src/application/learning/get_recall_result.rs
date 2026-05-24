use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::RecallSession;
use crate::setup::error::AppError;

pub async fn execute_get_recall_result(
    repo: &dyn LearningRepository,
    session_id: Uuid,
) -> Result<RecallSession, AppError> {
    repo.get_recall_result(session_id).await
}

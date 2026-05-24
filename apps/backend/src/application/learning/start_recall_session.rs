use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::RecallSession;
use crate::setup::error::AppError;

pub async fn execute_start_recall_session(
    repo: &dyn LearningRepository,
    user_id: Uuid,
    topic_id: Uuid,
) -> Result<RecallSession, AppError> {
    repo.start_recall_session(user_id, topic_id).await
}

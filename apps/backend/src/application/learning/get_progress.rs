use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::LearningProgress;
use crate::setup::error::AppError;

pub async fn execute_get_progress(
    repo: &dyn LearningRepository,
    user_id: Uuid,
    topic_id: Uuid,
) -> Result<LearningProgress, AppError> {
    repo.get_progress(user_id, topic_id).await
}

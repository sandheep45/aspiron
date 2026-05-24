use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::LearningProgress;
use crate::setup::error::AppError;

pub async fn execute_update_progress(
    repo: &dyn LearningRepository,
    user_id: Uuid,
    topic_id: Uuid,
    progress_percent: i32,
) -> Result<LearningProgress, AppError> {
    repo.update_progress(user_id, topic_id, progress_percent)
        .await
}

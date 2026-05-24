use uuid::Uuid;

use super::ports::ContentRepository;
use crate::domain::content::value_objects::OfflineToken;
use crate::setup::error::AppError;

pub async fn execute_get_offline_token(
    repo: &dyn ContentRepository,
    video_id: Uuid,
) -> Result<OfflineToken, AppError> {
    repo.get_offline_token(video_id).await
}

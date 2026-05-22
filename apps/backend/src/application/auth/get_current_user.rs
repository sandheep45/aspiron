use uuid::Uuid;

use super::ports::UserRepository;
use crate::domain::auth::entities::CurrentUser;
use crate::setup::error::AppError;

pub async fn execute_get_current_user(
    user_repo: &dyn UserRepository,
    user_id: Uuid,
) -> Result<CurrentUser, AppError> {
    user_repo.get_current_user(user_id).await
}

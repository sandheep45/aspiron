use super::ports::ContentRepository;
use crate::domain::content::entities::Subject;
use crate::setup::error::AppError;

pub async fn execute_get_subjects(repo: &dyn ContentRepository) -> Result<Vec<Subject>, AppError> {
    repo.get_subjects().await
}

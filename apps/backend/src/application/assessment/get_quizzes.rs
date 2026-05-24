use uuid::Uuid;

use super::ports::AssessmentRepository;
use crate::domain::assessment::entities::Quiz;
use crate::setup::error::AppError;

pub async fn execute_get_quizzes(
    repo: &dyn AssessmentRepository,
    topic_id: Uuid,
) -> Result<Vec<Quiz>, AppError> {
    repo.get_quizzes_by_topic(topic_id).await
}

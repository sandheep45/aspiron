use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::assessment::entities::{Attempt, Question, Quiz};
use crate::setup::error::AppError;

#[async_trait]
pub trait AssessmentRepository: Send + Sync {
    async fn get_quizzes_by_topic(&self, topic_id: Uuid) -> Result<Vec<Quiz>, AppError>;
    async fn get_quiz_by_id(&self, quiz_id: Uuid) -> Result<Quiz, AppError>;
    async fn get_questions_by_quiz(&self, quiz_id: Uuid) -> Result<Vec<Question>, AppError>;
    async fn create_attempt(&self, user_id: Uuid, quiz_id: Uuid) -> Result<Attempt, AppError>;
    async fn submit_attempt(
        &self,
        attempt_id: Uuid,
        answers: Vec<(Uuid, String)>,
    ) -> Result<Attempt, AppError>;
    async fn get_attempt_results(&self, attempt_id: Uuid) -> Result<Attempt, AppError>;
}

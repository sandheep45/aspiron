use uuid::Uuid;

use super::ports::LearningRepository;
use crate::domain::learning::entities::RecallAnswer;
use crate::setup::error::AppError;

pub async fn execute_submit_recall_answer(
    repo: &dyn LearningRepository,
    session_id: Uuid,
    question_id: Uuid,
    selected_option: usize,
) -> Result<RecallAnswer, AppError> {
    repo.submit_recall_answer(session_id, question_id, selected_option)
        .await
}

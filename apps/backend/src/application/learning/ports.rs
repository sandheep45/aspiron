use async_trait::async_trait;
use uuid::Uuid;

use crate::domain::assessment::entities::Question;
use crate::domain::learning::entities::{LearningProgress, Note, RecallAnswer, RecallSession};
use crate::setup::error::AppError;

pub fn find_correct_answer_index(
    options: &serde_json::Value,
    correct_answer: &str,
) -> Option<usize> {
    let obj = options.as_object()?;
    let keys: Vec<&str> = obj.keys().map(|k| k.as_str()).collect();
    keys.iter().position(|k| *k == correct_answer)
}

#[async_trait]
pub trait LearningRepository: Send + Sync {
    async fn get_all_notes(&self, user_id: Uuid) -> Result<Vec<Note>, AppError>;
    async fn get_teachers_notes(&self, topic_id: Uuid) -> Result<Vec<Note>, AppError>;
    async fn create_note(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
        title: String,
        content: String,
    ) -> Result<Note, AppError>;
    async fn update_note(
        &self,
        note_id: Uuid,
        title: Option<String>,
        content: Option<String>,
    ) -> Result<Note, AppError>;
    async fn delete_note(&self, note_id: Uuid) -> Result<(), AppError>;
    async fn get_progress(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
    ) -> Result<LearningProgress, AppError>;
    async fn update_progress(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
        progress_percent: i32,
    ) -> Result<LearningProgress, AppError>;
    async fn start_recall_session(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
    ) -> Result<RecallSession, AppError>;
    async fn get_recall_mcqs(&self, session_id: Uuid) -> Result<Vec<RecallAnswer>, AppError>;
    async fn submit_recall_answer(
        &self,
        session_id: Uuid,
        question_id: Uuid,
        selected_option: usize,
    ) -> Result<RecallAnswer, AppError>;
    async fn get_recall_result(&self, session_id: Uuid) -> Result<RecallSession, AppError>;
    async fn get_quiz_questions_for_topic(&self, topic_id: Uuid)
    -> Result<Vec<Question>, AppError>;
    async fn get_recall_answers_by_session(
        &self,
        session_id: Uuid,
    ) -> Result<Vec<RecallAnswer>, AppError>;
    async fn complete_recall_session(&self, session_id: Uuid) -> Result<RecallSession, AppError>;
}

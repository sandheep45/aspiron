use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::assessment::{
    AttemptResponse, AttemptResultResponse, QuestionResponse, QuizResponse,
};
use crate::entries::entities::assessment_quiz::Entity as AssessmentQuizEntity;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct AssessmentRepository {
    db: Arc<DatabaseConnection>,
}

impl AssessmentRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_quizzes_by_topic(
        &self,
        topic_id: Uuid,
    ) -> Result<Vec<QuizResponse>, AppError> {
        let quizzes = AssessmentQuizEntity::find()
            .filter(crate::entries::entities::assessment_quiz::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(quizzes
            .into_iter()
            .map(|q| QuizResponse {
                id: q.id,
                title: q.title,
                description: String::new(),
                time_limit_minutes: 0,
                passing_score: 0,
            })
            .collect())
    }

    pub async fn get_quiz_by_id(&self, _quiz_id: Uuid) -> Result<QuizResponse, AppError> {
        todo!()
    }

    pub async fn get_questions_by_quiz(
        &self,
        _quiz_id: Uuid,
    ) -> Result<Vec<QuestionResponse>, AppError> {
        todo!()
    }

    pub async fn create_attempt(
        &self,
        _user_id: Uuid,
        _quiz_id: Uuid,
    ) -> Result<AttemptResponse, AppError> {
        todo!()
    }

    pub async fn submit_attempt(
        &self,
        _attempt_id: Uuid,
        _answers: Vec<crate::entries::dtos::response::assessment::AnswerRequest>,
    ) -> Result<AttemptResultResponse, AppError> {
        todo!()
    }

    pub async fn get_attempt_results(
        &self,
        _attempt_id: Uuid,
    ) -> Result<AttemptResultResponse, AppError> {
        todo!()
    }
}

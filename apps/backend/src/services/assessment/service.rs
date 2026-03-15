use std::sync::Arc;

use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::setup::error::AppError;

#[derive(Clone)]
pub struct AssessmentService {
    // repository: AssessmentRepository,
}

impl AssessmentService {
    pub fn new(_db: Arc<DatabaseConnection>) -> Self {
        Self {
            // repository: AssessmentRepository::new(db),
        }
    }

    pub async fn get_quizzes_by_topic(
        &self,
        _topic_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_quiz_by_id(&self, _quiz_id: Uuid) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_questions_by_quiz(
        &self,
        _quiz_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn create_attempt(
        &self,
        _user_id: Uuid,
        _quiz_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn submit_attempt(
        &self,
        _attempt_id: Uuid,
        _answers: Vec<crate::entries::dtos::response::assessment::AnswerRequest>,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }

    pub async fn get_attempt_results(
        &self,
        _attempt_id: Uuid,
    ) -> Result<axum::Json<bool>, AppError> {
        Ok(axum::Json(true))
    }
}

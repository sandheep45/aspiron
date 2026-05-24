use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::application::assessment::ports::AssessmentRepository;
use crate::domain::assessment::entities::{Attempt, Question, Quiz};
use crate::domain::assessment::value_objects::QuizScore;
use crate::entries::entities::assessment_attempt;
use crate::entries::entities::assessment_question;
use crate::entries::entities::assessment_quiz;
use crate::setup::error::AppError;

pub(crate) struct SeaOrmAssessmentRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmAssessmentRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl AssessmentRepository for SeaOrmAssessmentRepository {
    async fn get_quizzes_by_topic(&self, topic_id: Uuid) -> Result<Vec<Quiz>, AppError> {
        let quizzes = assessment_quiz::Entity::find()
            .filter(assessment_quiz::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(quizzes.into_iter().map(map_quiz_orm_to_domain).collect())
    }

    async fn get_quiz_by_id(&self, quiz_id: Uuid) -> Result<Quiz, AppError> {
        let orm = assessment_quiz::Entity::find_by_id(quiz_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Quiz not found"))?;

        Ok(map_quiz_orm_to_domain(orm))
    }

    async fn get_questions_by_quiz(&self, quiz_id: Uuid) -> Result<Vec<Question>, AppError> {
        let questions = assessment_question::Entity::find()
            .filter(assessment_question::Column::QuizId.eq(quiz_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(questions
            .into_iter()
            .map(map_question_orm_to_domain)
            .collect())
    }

    async fn create_attempt(&self, user_id: Uuid, quiz_id: Uuid) -> Result<Attempt, AppError> {
        let active = assessment_attempt::ActiveModel {
            id: Set(Uuid::new_v4()),
            quiz_id: Set(quiz_id),
            user_id: Set(user_id),
            started_at: Set(chrono::Utc::now().into()),
            submitted_at: Set(None),
            score: Set(0),
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_attempt_active_to_domain(result))
    }

    async fn submit_attempt(
        &self,
        attempt_id: Uuid,
        _answers: Vec<(Uuid, String)>,
    ) -> Result<Attempt, AppError> {
        let attempt = assessment_attempt::Entity::find_by_id(attempt_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Attempt not found"))?;

        let mut active: assessment_attempt::ActiveModel = attempt.into();
        active.submitted_at = Set(Some(chrono::Utc::now().into()));
        active.score = Set(100);

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_attempt_active_to_domain(result))
    }

    async fn get_attempt_results(&self, attempt_id: Uuid) -> Result<Attempt, AppError> {
        let orm = assessment_attempt::Entity::find_by_id(attempt_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Attempt not found"))?;

        Ok(map_attempt_orm_to_domain(orm))
    }
}

fn map_quiz_orm_to_domain(q: assessment_quiz::Model) -> Quiz {
    Quiz {
        id: q.id,
        topic_id: q.topic_id,
        title: q.title,
        description: String::new(),
        time_limit_minutes: 0,
        passing_score: 0,
    }
}

fn map_question_orm_to_domain(q: assessment_question::Model) -> Question {
    Question {
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        correct_answer: q.correct_answer,
        options: q.options,
    }
}

fn map_attempt_orm_to_domain(a: assessment_attempt::Model) -> Attempt {
    Attempt {
        id: a.id,
        quiz_id: a.quiz_id,
        user_id: a.user_id,
        started_at: a.started_at.into(),
        submitted_at: a.submitted_at.map(Into::into),
        score: QuizScore::new(a.score),
    }
}

fn map_attempt_active_to_domain(a: assessment_attempt::ActiveModel) -> Attempt {
    Attempt {
        id: a.id.clone().unwrap(),
        quiz_id: a.quiz_id.clone().unwrap(),
        user_id: a.user_id.clone().unwrap(),
        started_at: a.started_at.clone().unwrap().into(),
        submitted_at: a.submitted_at.clone().unwrap().map(|dt| dt.into()),
        score: QuizScore::new(a.score.clone().unwrap()),
    }
}

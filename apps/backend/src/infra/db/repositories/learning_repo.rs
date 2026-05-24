use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::ActiveValue::NotSet;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::application::learning::ports::LearningRepository;
use crate::domain::learning::entities::{LearningProgress, Note, RecallAnswer, RecallSession};
use crate::domain::learning::value_objects::{ProgressPercentage, RecallSessionStatus};
use crate::entries::entities::learning_notes;
use crate::entries::entities::learning_progress;
use crate::entries::entities::learning_recall_answer;
use crate::entries::entities::learning_recall_session;
use crate::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use crate::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;
use crate::setup::error::AppError;

pub(crate) struct SeaOrmLearningRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmLearningRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl LearningRepository for SeaOrmLearningRepository {
    async fn get_all_notes(&self, user_id: Uuid) -> Result<Vec<Note>, AppError> {
        let notes = learning_notes::Entity::find()
            .filter(learning_notes::Column::OwnerId.eq(user_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(notes.into_iter().map(map_note_orm_to_domain).collect())
    }

    async fn get_teachers_notes(&self, topic_id: Uuid) -> Result<Vec<Note>, AppError> {
        let notes = learning_notes::Entity::find()
            .filter(learning_notes::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(notes.into_iter().map(map_note_orm_to_domain).collect())
    }

    async fn create_note(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
        _title: String,
        content: String,
    ) -> Result<Note, AppError> {
        let orm = learning_notes::ActiveModel {
            id: Set(Uuid::new_v4()),
            topic_id: Set(topic_id),
            owner_id: Set(Some(user_id)),
            owner_type: NotSet,
            video_id: NotSet,
            video_timestamp: NotSet,
            content_type: NotSet,
            content: Set(Some(content)),
            external_url: NotSet,
            external_type: NotSet,
            is_public: Set(false),
            trust_level: NotSet,
            created_at: NotSet,
            updated_at: NotSet,
            deleted_at: NotSet,
        };

        let result = orm.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_note_active_to_domain(result))
    }

    async fn update_note(
        &self,
        note_id: Uuid,
        _title: Option<String>,
        content: Option<String>,
    ) -> Result<Note, AppError> {
        let note = learning_notes::Entity::find_by_id(note_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Note not found"))?;

        let mut active: learning_notes::ActiveModel = note.into();
        if let Some(c) = content {
            active.content = Set(Some(c));
        }

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_note_active_to_domain(result))
    }

    async fn delete_note(&self, note_id: Uuid) -> Result<(), AppError> {
        learning_notes::Entity::delete_by_id(note_id)
            .exec(&*self.db)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    async fn get_progress(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
    ) -> Result<LearningProgress, AppError> {
        let orm = learning_progress::Entity::find()
            .filter(learning_progress::Column::UserId.eq(user_id))
            .filter(learning_progress::Column::TopicId.eq(topic_id))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Progress not found"))?;

        Ok(map_progress_orm_to_domain(orm))
    }

    async fn update_progress(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
        progress_percent: i32,
    ) -> Result<LearningProgress, AppError> {
        let existing = learning_progress::Entity::find()
            .filter(learning_progress::Column::UserId.eq(user_id))
            .filter(learning_progress::Column::TopicId.eq(topic_id))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let active = if let Some(record) = existing {
            let mut a: learning_progress::ActiveModel = record.into();
            a.progress_percent = Set(progress_percent);
            a.last_accessed_at = Set(chrono::Utc::now().into());
            a
        } else {
            learning_progress::ActiveModel {
                id: Set(Uuid::new_v4()),
                user_id: Set(user_id),
                topic_id: Set(topic_id),
                progress_percent: Set(progress_percent),
                last_accessed_at: Set(chrono::Utc::now().into()),
            }
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_progress_active_to_domain(result))
    }

    async fn start_recall_session(
        &self,
        user_id: Uuid,
        topic_id: Uuid,
    ) -> Result<RecallSession, AppError> {
        let active = learning_recall_session::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            topic_id: Set(topic_id),
            status: Set(LearningRecallSessionStatusEnum::PENDING),
            started_at: Set(chrono::Utc::now().into()),
            completed_at: Set(None),
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_session_active_to_domain(result))
    }

    async fn get_recall_mcqs(&self, session_id: Uuid) -> Result<Vec<RecallAnswer>, AppError> {
        let answers = learning_recall_answer::Entity::find()
            .filter(learning_recall_answer::Column::SessionId.eq(session_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(answers.into_iter().map(map_answer_orm_to_domain).collect())
    }

    async fn submit_recall_answer(
        &self,
        session_id: Uuid,
        _question_id: Uuid,
        _selected_option: usize,
    ) -> Result<RecallAnswer, AppError> {
        let active = learning_recall_answer::ActiveModel {
            id: Set(Uuid::new_v4()),
            session_id: Set(session_id),
            question_type: Set(LearningRecallQuestionTypeEnum::MCQ),
            question: Set(String::new()),
            answer: Set(String::new()),
            is_correct: Set(true),
            score: Set(Some(1)),
        };

        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_answer_active_to_domain(result))
    }

    async fn get_recall_result(&self, session_id: Uuid) -> Result<RecallSession, AppError> {
        let orm = learning_recall_session::Entity::find_by_id(session_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Recall session not found"))?;

        Ok(map_session_orm_to_domain(orm))
    }
}

fn map_note_orm_to_domain(n: learning_notes::Model) -> Note {
    Note {
        id: n.id,
        topic_id: n.topic_id,
        owner_id: n.owner_id,
        owner_type: format!("{:?}", n.owner_type),
        content: n.content,
        title: String::new(),
        is_official: false,
        is_public: n.is_public,
        created_at: n.created_at.into(),
        updated_at: n.updated_at.into(),
    }
}

fn map_note_active_to_domain(n: learning_notes::ActiveModel) -> Note {
    Note {
        id: n.id.clone().unwrap(),
        topic_id: n.topic_id.clone().unwrap(),
        owner_id: n.owner_id.clone().unwrap(),
        owner_type: String::new(),
        content: n.content.clone().unwrap(),
        title: String::new(),
        is_official: false,
        is_public: false,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    }
}

fn map_progress_orm_to_domain(p: learning_progress::Model) -> LearningProgress {
    LearningProgress {
        id: p.id,
        user_id: p.user_id,
        topic_id: p.topic_id,
        progress_percent: ProgressPercentage::new(p.progress_percent),
        last_accessed_at: p.last_accessed_at.into(),
    }
}

fn map_progress_active_to_domain(p: learning_progress::ActiveModel) -> LearningProgress {
    LearningProgress {
        id: p.id.clone().unwrap(),
        user_id: p.user_id.clone().unwrap(),
        topic_id: p.topic_id.clone().unwrap(),
        progress_percent: ProgressPercentage::new(p.progress_percent.clone().unwrap()),
        last_accessed_at: chrono::Utc::now(),
    }
}

fn map_session_orm_to_domain(s: learning_recall_session::Model) -> RecallSession {
    let status_str = format!("{:?}", s.status).to_lowercase();
    RecallSession {
        id: s.id,
        user_id: s.user_id,
        topic_id: s.topic_id,
        status: status_str.parse().unwrap_or(RecallSessionStatus::Pending),
        started_at: s.started_at.into(),
        completed_at: s.completed_at.map(Into::into),
    }
}

fn map_session_active_to_domain(s: learning_recall_session::ActiveModel) -> RecallSession {
    RecallSession {
        id: s.id.clone().unwrap(),
        user_id: s.user_id.clone().unwrap(),
        topic_id: s.topic_id.clone().unwrap(),
        status: RecallSessionStatus::Pending,
        started_at: chrono::Utc::now(),
        completed_at: None,
    }
}

fn map_answer_orm_to_domain(a: learning_recall_answer::Model) -> RecallAnswer {
    RecallAnswer {
        id: a.id,
        session_id: a.session_id,
        question_type: format!("{:?}", a.question_type),
        question: a.question,
        answer: a.answer,
        is_correct: a.is_correct,
        score: a.score,
    }
}

fn map_answer_active_to_domain(a: learning_recall_answer::ActiveModel) -> RecallAnswer {
    let qt = format!("{:?}", a.question_type.clone().unwrap());
    RecallAnswer {
        id: a.id.clone().unwrap(),
        session_id: a.session_id.clone().unwrap(),
        question_type: qt,
        question: a.question.clone().unwrap(),
        answer: a.answer.clone().unwrap(),
        is_correct: a.is_correct.clone().unwrap(),
        score: a.score.clone().unwrap(),
    }
}

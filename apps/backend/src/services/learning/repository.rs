use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::learning::NoteResponse;
use crate::entries::entities::learning_notes::Entity as LearningNotesEntity;
use crate::entries::entity_enums::content_owner_types::ContentOwnerTypeEnum;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct LearningRepository {
    db: Arc<DatabaseConnection>,
}

impl LearningRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_notes_by_user(&self, user_id: Uuid) -> Result<Vec<NoteResponse>, AppError> {
        let notes = LearningNotesEntity::find()
            .filter(crate::entries::entities::learning_notes::Column::OwnerId.eq(user_id))
            .filter(
                crate::entries::entities::learning_notes::Column::OwnerType
                    .eq(ContentOwnerTypeEnum::STUDENT),
            )
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(notes
            .into_iter()
            .map(|n| NoteResponse {
                id: n.id,
                user_id: n.owner_id.unwrap_or(user_id),
                topic_id: n.topic_id,
                title: String::new(),
                content: n.content.unwrap_or_default(),
                is_official: false,
            })
            .collect())
    }

    pub async fn create_note(
        &self,
        _user_id: Uuid,
        _topic_id: Uuid,
        _content: String,
    ) -> Result<NoteResponse, AppError> {
        todo!()
    }

    pub async fn update_note(
        &self,
        _note_id: Uuid,
        _content: Option<String>,
    ) -> Result<NoteResponse, AppError> {
        todo!()
    }

    pub async fn delete_note(&self, _note_id: Uuid) -> Result<(), AppError> {
        todo!()
    }

    pub async fn get_teacher_notes(&self, _topic_id: Uuid) -> Result<Vec<NoteResponse>, AppError> {
        todo!()
    }
}

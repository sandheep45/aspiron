use std::sync::Arc;

use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::entries::dtos::response::live_session::{LiveClassResponse, RecordingResponse};
use crate::entries::entities::live_session::Entity as LiveSessionEntity;
use crate::entries::entities::live_session_recording::Entity as LiveSessionRecordingEntity;
use crate::setup::error::AppError;

#[derive(Clone)]
pub struct LiveSessionRepository {
    db: Arc<DatabaseConnection>,
}

impl LiveSessionRepository {
    pub fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }

    pub async fn get_upcoming_classes(&self) -> Result<Vec<LiveClassResponse>, AppError> {
        let sessions = LiveSessionEntity::find()
            .filter(
                crate::entries::entities::live_session::Column::ScheduledAt.gt(chrono::Utc::now()),
            )
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(sessions
            .into_iter()
            .map(|s| LiveClassResponse {
                id: s.id,
                topic_id: s.topic_id,
                scheduled_at: s.scheduled_at,
                duration_min: s.duration_min,
                provider: s.provider,
                join_url: s.join_url,
            })
            .collect())
    }

    pub async fn join_class(
        &self,
        _user_id: Uuid,
        _class_id: Uuid,
    ) -> Result<LiveClassResponse, AppError> {
        todo!()
    }

    pub async fn get_recorded_sessions(
        &self,
        class_id: Uuid,
    ) -> Result<Vec<RecordingResponse>, AppError> {
        let recordings = LiveSessionRecordingEntity::find()
            .filter(
                crate::entries::entities::live_session_recording::Column::SessionId.eq(class_id),
            )
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(recordings
            .into_iter()
            .map(|r| RecordingResponse {
                id: r.id,
                session_id: r.session_id,
                recording_url: r.recording_url,
            })
            .collect())
    }
}

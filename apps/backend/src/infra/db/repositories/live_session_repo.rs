use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::application::live_session::ports::LiveSessionRepository;
use crate::domain::live_session::entities::{LiveSession, Recording};
use crate::entries::entities::live_session::{
    Column as LiveSessionColumn, Entity as LiveSessionEntity,
};
use crate::entries::entities::live_session_recording::{
    Column as RecordingColumn, Entity as RecordingEntity,
};
use crate::setup::error::AppError;

pub(crate) struct SeaOrmLiveSessionRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmLiveSessionRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl LiveSessionRepository for SeaOrmLiveSessionRepository {
    async fn get_upcoming_classes(&self) -> Result<Vec<LiveSession>, AppError> {
        let sessions = LiveSessionEntity::find()
            .filter(LiveSessionColumn::ScheduledAt.gt(chrono::Utc::now()))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(sessions
            .into_iter()
            .map(map_session_orm_to_domain)
            .collect())
    }

    async fn join_class(&self, _user_id: Uuid, _class_id: Uuid) -> Result<LiveSession, AppError> {
        Err(AppError::Internal(anyhow::anyhow!(
            "not implemented: join_class"
        )))
    }

    async fn get_recorded_sessions(&self, class_id: Uuid) -> Result<Vec<Recording>, AppError> {
        let recordings = RecordingEntity::find()
            .filter(RecordingColumn::SessionId.eq(class_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(recordings
            .into_iter()
            .map(map_recording_orm_to_domain)
            .collect())
    }
}

fn map_session_orm_to_domain(s: crate::entries::entities::live_session::Model) -> LiveSession {
    LiveSession {
        id: s.id,
        topic_id: s.topic_id,
        scheduled_at: s.scheduled_at.into(),
        duration_min: s.duration_min,
        provider: s.provider,
        join_url: s.join_url,
    }
}

fn map_recording_orm_to_domain(
    r: crate::entries::entities::live_session_recording::Model,
) -> Recording {
    Recording {
        id: r.id,
        session_id: r.session_id,
        recording_url: r.recording_url,
        created_at: r.created_at.into(),
    }
}

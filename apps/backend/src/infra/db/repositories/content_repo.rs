use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::application::content::ports::ContentRepository;
use crate::domain::content::entities::{Chapter, Subject, Topic, Video};
use crate::domain::content::value_objects::OfflineToken;
use crate::entries::entities::content_chapter;
use crate::entries::entities::content_subject;
use crate::entries::entities::content_topic;
use crate::entries::entities::content_video;
use crate::setup::error::AppError;

pub(crate) struct SeaOrmContentRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmContentRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl ContentRepository for SeaOrmContentRepository {
    async fn get_subjects(&self) -> Result<Vec<Subject>, AppError> {
        let subjects = content_subject::Entity::find()
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(subjects
            .into_iter()
            .map(map_subject_orm_to_domain)
            .collect())
    }

    async fn get_chapters_by_subject(&self, subject_id: Uuid) -> Result<Vec<Chapter>, AppError> {
        let chapters = content_chapter::Entity::find()
            .filter(content_chapter::Column::SubjectId.eq(subject_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(chapters
            .into_iter()
            .map(map_chapter_orm_to_domain)
            .collect())
    }

    async fn get_topics_by_chapter(&self, chapter_id: Uuid) -> Result<Vec<Topic>, AppError> {
        let topics = content_topic::Entity::find()
            .filter(content_topic::Column::ChapterId.eq(chapter_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(topics.into_iter().map(map_topic_orm_to_domain).collect())
    }

    async fn get_topic_by_id(&self, topic_id: Uuid) -> Result<Topic, AppError> {
        let topic = content_topic::Entity::find()
            .filter(content_topic::Column::Id.eq(topic_id))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Invalid Topic ID"))?;

        Ok(map_topic_orm_to_domain(topic))
    }

    async fn get_videos_by_topic(&self, topic_id: Uuid) -> Result<Vec<Video>, AppError> {
        let videos = content_video::Entity::find()
            .filter(content_video::Column::TopicId.eq(topic_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(videos.into_iter().map(map_video_orm_to_domain).collect())
    }

    async fn get_offline_token(&self, _video_id: Uuid) -> Result<OfflineToken, AppError> {
        Ok(OfflineToken {
            token: "stub-token".to_string(),
            expires_at: chrono::Utc::now() + chrono::Duration::hours(24),
        })
    }
}

fn map_subject_orm_to_domain(s: content_subject::Model) -> Subject {
    Subject {
        id: s.id,
        name: s.name,
        exam_type: format!("{:?}", s.exam_type),
        created_at: s.created_at.into(),
        updated_at: s.updated_at.into(),
    }
}

fn map_chapter_orm_to_domain(c: content_chapter::Model) -> Chapter {
    Chapter {
        id: c.id,
        name: c.name,
        subject_id: c.subject_id,
        order_number: c.order_number,
    }
}

fn map_topic_orm_to_domain(t: content_topic::Model) -> Topic {
    Topic {
        id: t.id,
        name: t.name,
        chapter_id: t.chapter_id,
        order_number: t.order_number,
    }
}

fn map_video_orm_to_domain(v: content_video::Model) -> Video {
    Video {
        id: v.id,
        topic_id: v.topic_id,
        title: v.title,
        duration_seconds: v.duration_seconds,
        video_url: v.video_url,
        transcript: v.transcript,
    }
}

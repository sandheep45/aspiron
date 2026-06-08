use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sea_orm::{
    ColumnTrait, DatabaseConnection, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder,
    QuerySelect,
};
use uuid::Uuid;

use crate::application::content::chapters_page_types::{
    ChapterInsightData, ChapterSummaryData, ChapterWithMetrics, categorize_chapter_insights,
};
use crate::application::content::ports::ContentRepository;
use crate::domain::content::entities::{Chapter, Subject, Topic, Video};
use crate::domain::content::value_objects::OfflineToken;
use crate::entries::entities::{
    assessment_attempt, assessment_quiz, content_chapter, content_subject, content_topic,
    content_video, learning_recall_answer, learning_recall_session,
};
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

    async fn get_subject_by_id(&self, subject_id: Uuid) -> Result<Subject, AppError> {
        let subject = content_subject::Entity::find()
            .filter(content_subject::Column::Id.eq(subject_id))
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Subject not found"))?;

        Ok(map_subject_orm_to_domain(subject))
    }

    async fn get_topics_by_chapter_ids(
        &self,
        chapter_ids: Vec<Uuid>,
    ) -> Result<Vec<Topic>, AppError> {
        if chapter_ids.is_empty() {
            return Ok(Vec::new());
        }

        let topics = content_topic::Entity::find()
            .filter(content_topic::Column::ChapterId.is_in(chapter_ids))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(topics.into_iter().map(map_topic_orm_to_domain).collect())
    }

    async fn get_chapter_summary(&self, subject_id: Uuid) -> Result<ChapterSummaryData, AppError> {
        let db = &*self.db;

        let subject = content_subject::Entity::find()
            .filter(content_subject::Column::Id.eq(subject_id))
            .one(db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Subject not found"))?;

        let chapters = content_chapter::Entity::find()
            .filter(content_chapter::Column::SubjectId.eq(subject_id))
            .all(db)
            .await
            .map_err(AppError::Database)?;

        let total_chapters = chapters.len() as i64;

        let chapter_ids: Vec<Uuid> = chapters.iter().map(|c| c.id).collect();

        let (total_topics, topic_ids, topics) = if chapter_ids.is_empty() {
            (0i64, Vec::new(), Vec::new())
        } else {
            let topics = content_topic::Entity::find()
                .filter(content_topic::Column::ChapterId.is_in(chapter_ids.clone()))
                .all(db)
                .await
                .map_err(AppError::Database)?;
            let ids: Vec<Uuid> = topics.iter().map(|t| t.id).collect();
            (topics.len() as i64, ids, topics)
        };

        let quiz_topic_ids: Vec<Uuid> = assessment_quiz::Entity::find()
            .select_only()
            .column(assessment_quiz::Column::TopicId)
            .distinct()
            .into_tuple::<Uuid>()
            .all(db)
            .await
            .unwrap_or_default();

        let published_topics = topic_ids
            .iter()
            .filter(|id| quiz_topic_ids.contains(id))
            .count() as i64;

        let draft_topics = total_topics - published_topics;

        let topics_by_chapter: std::collections::HashMap<Uuid, Vec<Uuid>> = {
            let mut map: std::collections::HashMap<Uuid, Vec<Uuid>> =
                std::collections::HashMap::new();
            for t in &topics {
                map.entry(t.chapter_id).or_default().push(t.id);
            }
            map
        };

        let mut chapters_with_weak_recall = 0i64;
        for chapter in &chapters {
            let chapter_topic_ids = topics_by_chapter
                .get(&chapter.id)
                .cloned()
                .unwrap_or_default();

            if chapter_topic_ids.is_empty() {
                continue;
            }

            let recall_session_topic_ids: Vec<Uuid> = learning_recall_session::Entity::find()
                .select_only()
                .column(learning_recall_session::Column::TopicId)
                .filter(learning_recall_session::Column::TopicId.is_in(chapter_topic_ids.clone()))
                .distinct()
                .into_tuple::<Uuid>()
                .all(db)
                .await
                .unwrap_or_default();

            if recall_session_topic_ids.is_empty() {
                continue;
            }

            let mut correct = 0u64;
            let mut total_recall = 0u64;
            for tid in &recall_session_topic_ids {
                let c = learning_recall_answer::Entity::find()
                    .inner_join(learning_recall_session::Entity)
                    .filter(learning_recall_session::Column::TopicId.eq(*tid))
                    .filter(learning_recall_answer::Column::IsCorrect.eq(true))
                    .count(db)
                    .await
                    .unwrap_or(0);

                let t = learning_recall_answer::Entity::find()
                    .inner_join(learning_recall_session::Entity)
                    .filter(learning_recall_session::Column::TopicId.eq(*tid))
                    .count(db)
                    .await
                    .unwrap_or(0);

                correct += c;
                total_recall += t;
            }

            if total_recall > 0 && (correct as f64 / total_recall as f64) < 0.6 {
                chapters_with_weak_recall += 1;
            }
        }

        Ok(ChapterSummaryData {
            subject_name: subject.name,
            total_chapters,
            published_topics,
            draft_topics,
            chapters_needing_attention: chapters_with_weak_recall,
        })
    }

    async fn get_chapters_with_metrics(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<ChapterWithMetrics>, AppError> {
        let db = &*self.db;

        let chapters = content_chapter::Entity::find()
            .filter(content_chapter::Column::SubjectId.eq(subject_id))
            .all(db)
            .await
            .map_err(AppError::Database)?;

        let chapter_ids: Vec<Uuid> = chapters.iter().map(|c| c.id).collect();

        let topics = if chapter_ids.is_empty() {
            Vec::new()
        } else {
            content_topic::Entity::find()
                .filter(content_topic::Column::ChapterId.is_in(chapter_ids.clone()))
                .all(db)
                .await
                .map_err(AppError::Database)?
        };

        let quiz_topic_ids: Vec<Uuid> = assessment_quiz::Entity::find()
            .select_only()
            .column(assessment_quiz::Column::TopicId)
            .distinct()
            .into_tuple::<Uuid>()
            .all(db)
            .await
            .unwrap_or_default();

        let mut results = Vec::new();

        for chapter in &chapters {
            let chapter_topics: Vec<&content_topic::Model> = topics
                .iter()
                .filter(|t| t.chapter_id == chapter.id)
                .collect();

            let total_topics = chapter_topics.len() as i64;

            if total_topics == 0 {
                results.push(ChapterWithMetrics {
                    id: chapter.id,
                    name: chapter.name.clone(),
                    subject_id: chapter.subject_id,
                    published_topics: 0,
                    total_topics: 0,
                    coverage: 0.0,
                    avg_recall: None,
                    practice_accuracy: None,
                    last_activity_at: None,
                });
                continue;
            }

            let topic_ids: Vec<Uuid> = chapter_topics.iter().map(|t| t.id).collect();
            let published = topic_ids
                .iter()
                .filter(|id| quiz_topic_ids.contains(id))
                .count() as i64;
            let coverage = (published as f64 / total_topics as f64) * 100.0;

            let recall_session_topic_ids: Vec<Uuid> = learning_recall_session::Entity::find()
                .select_only()
                .column(learning_recall_session::Column::TopicId)
                .filter(learning_recall_session::Column::TopicId.is_in(topic_ids.clone()))
                .distinct()
                .into_tuple::<Uuid>()
                .all(db)
                .await
                .unwrap_or_default();

            let avg_recall = if recall_session_topic_ids.is_empty() {
                None
            } else {
                let mut correct = 0u64;
                let mut total_recall = 0u64;
                for tid in &recall_session_topic_ids {
                    let c = learning_recall_answer::Entity::find()
                        .inner_join(learning_recall_session::Entity)
                        .filter(learning_recall_session::Column::TopicId.eq(*tid))
                        .filter(learning_recall_answer::Column::IsCorrect.eq(true))
                        .count(db)
                        .await
                        .unwrap_or(0);
                    let t = learning_recall_answer::Entity::find()
                        .inner_join(learning_recall_session::Entity)
                        .filter(learning_recall_session::Column::TopicId.eq(*tid))
                        .count(db)
                        .await
                        .unwrap_or(0);
                    correct += c;
                    total_recall += t;
                }
                if total_recall > 0 {
                    Some(correct as f64 / total_recall as f64)
                } else {
                    None
                }
            };

            let quiz_ids: Vec<Uuid> = assessment_quiz::Entity::find()
                .select_only()
                .column(assessment_quiz::Column::Id)
                .filter(assessment_quiz::Column::TopicId.is_in(topic_ids.clone()))
                .into_tuple::<Uuid>()
                .all(db)
                .await
                .unwrap_or_default();

            let practice_accuracy = if quiz_ids.is_empty() {
                None
            } else {
                let attempts = assessment_attempt::Entity::find()
                    .filter(assessment_attempt::Column::QuizId.is_in(quiz_ids.clone()))
                    .all(db)
                    .await
                    .map_err(AppError::Database)?;

                if attempts.is_empty() {
                    None
                } else {
                    let total_score: i32 = attempts.iter().map(|a| a.score).sum();
                    let count = attempts.len() as f64;
                    Some((total_score as f64 / count) / 100.0)
                }
            };

            let mut last_activity: Option<DateTime<Utc>> = None;

            if !recall_session_topic_ids.is_empty() {
                let latest_session = learning_recall_session::Entity::find()
                    .filter(learning_recall_session::Column::TopicId.is_in(topic_ids.clone()))
                    .order_by_desc(learning_recall_session::Column::CompletedAt)
                    .one(db)
                    .await
                    .map_err(AppError::Database)?;
                if let Some(session) = latest_session
                    && let Some(completed) = session.completed_at
                {
                    let utc_completed: DateTime<Utc> = completed.into();
                    last_activity = Some(
                        last_activity
                            .map(|la| la.max(utc_completed))
                            .unwrap_or(utc_completed),
                    );
                }
            }

            if !quiz_ids.is_empty() {
                let latest_attempt = assessment_attempt::Entity::find()
                    .filter(assessment_attempt::Column::QuizId.is_in(quiz_ids.clone()))
                    .order_by_desc(assessment_attempt::Column::SubmittedAt)
                    .one(db)
                    .await
                    .map_err(AppError::Database)?;
                if let Some(attempt) = latest_attempt
                    && let Some(submitted) = attempt.submitted_at
                {
                    let utc_submitted: DateTime<Utc> = submitted.into();
                    last_activity = Some(
                        last_activity
                            .map(|la| la.max(utc_submitted))
                            .unwrap_or(utc_submitted),
                    );
                }
            }

            results.push(ChapterWithMetrics {
                id: chapter.id,
                name: chapter.name.clone(),
                subject_id: chapter.subject_id,
                published_topics: published,
                total_topics,
                coverage,
                avg_recall,
                practice_accuracy,
                last_activity_at: last_activity,
            });
        }

        Ok(results)
    }

    async fn get_chapter_insights(
        &self,
        subject_id: Uuid,
    ) -> Result<Vec<ChapterInsightData>, AppError> {
        let metrics = self.get_chapters_with_metrics(subject_id).await?;
        Ok(categorize_chapter_insights(&metrics))
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

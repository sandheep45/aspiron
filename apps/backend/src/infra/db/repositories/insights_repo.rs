use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sea_orm::{ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::application::insights::ports::InsightsRepository;
use crate::domain::insights::entities::{
    Insight, InsightType, LowAttendanceMetadata, LowEngagementMetadata, QuizReviewPendingMetadata,
    Severity, TopicDifficultyMetadata, TopicPerformance,
};
use crate::entries::entities::assessment_attempt::Column as AttemptColumn;
use crate::entries::entities::assessment_attempt::Entity as AttemptEntity;
use crate::entries::entities::content_chapter::{
    Column as ChapterColumn, Entity as ChapterEntity, Model as ChapterModel,
};
use crate::entries::entities::content_subject::{
    Column as SubjectColumn, Entity as SubjectEntity, Model as SubjectModel,
};
use crate::entries::entities::content_topic::{Column as TopicColumn, Entity as TopicEntity};
use crate::entries::entities::learning_progress::{
    Column as ProgressColumn, Entity as ProgressEntity,
};
use crate::entries::entities::learning_recall_answer::{
    Column as RecallAnswerColumn, Entity as RecallAnswerEntity, Model as RecallAnswerModel,
};
use crate::entries::entities::learning_recall_session::{
    Column as RecallSessionColumn, Entity as RecallSessionEntity,
};
use crate::entries::entities::live_session::{
    Column as LiveSessionColumn, Entity as LiveSessionEntity,
};
use crate::entries::entities::live_session_attendee::{
    Column as AttendeeColumn, Entity as AttendeeEntity,
};
use crate::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use crate::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;
use crate::setup::error::AppError;

pub(crate) struct SeaOrmInsightsRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmInsightsRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl InsightsRepository for SeaOrmInsightsRepository {
    async fn get_quizzes_pending_review(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let attempts = AttemptEntity::find()
            .filter(AttemptColumn::SubmittedAt.gte(start))
            .filter(AttemptColumn::SubmittedAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if attempts.is_empty() {
            return Ok(vec![]);
        }

        let mut quiz_counts: std::collections::HashMap<Uuid, i64> =
            std::collections::HashMap::new();
        for attempt in &attempts {
            *quiz_counts.entry(attempt.quiz_id).or_insert(0) += 1;
        }

        let mut insights = vec![];

        for (quiz_id, count) in quiz_counts {
            let severity = if count > 50 {
                Severity::Danger
            } else if count > 30 {
                Severity::Warning
            } else if count > 15 {
                Severity::Info
            } else if count > 5 {
                Severity::Neutral
            } else {
                Severity::Success
            };

            insights.push(Insight {
                id: Uuid::new_v4(),
                insight_type: InsightType::QuizReviewPending,
                severity,
                title: format!("{} attempts pending review", count),
                description: format!("Quiz has {} attempts awaiting teacher review", count),
                metadata: serde_json::to_value(QuizReviewPendingMetadata {
                    quiz_id,
                    pending_count: count,
                })
                .unwrap(),
                detected_at: Utc::now(),
            });
        }

        Ok(insights)
    }

    async fn get_low_attendance_sessions(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let sessions = LiveSessionEntity::find()
            .filter(LiveSessionColumn::ScheduledAt.gte(start))
            .filter(LiveSessionColumn::ScheduledAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if sessions.is_empty() {
            return Ok(vec![]);
        }

        let session_ids: Vec<Uuid> = sessions.iter().map(|s| s.id).collect();

        let attendee_counts = AttendeeEntity::find()
            .filter(AttendeeColumn::SessionId.is_in(session_ids.clone()))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let mut count_map: std::collections::HashMap<Uuid, i64> = std::collections::HashMap::new();
        for attendee in &attendee_counts {
            *count_map.entry(attendee.session_id).or_insert(0) += 1;
        }

        let mut insights = vec![];

        for session in sessions {
            let attendee_count = count_map.get(&session.id).copied().unwrap_or(0);

            let severity = if attendee_count == 0 {
                Severity::Danger
            } else if attendee_count < 3 {
                Severity::Warning
            } else if attendee_count < 10 {
                Severity::Info
            } else if attendee_count < 20 {
                Severity::Neutral
            } else {
                Severity::Success
            };

            insights.push(Insight {
                id: Uuid::new_v4(),
                insight_type: InsightType::LowAttendance,
                severity,
                title: format!("Low attendance: {} attendees", attendee_count),
                description: format!("Live session had only {} attendees", attendee_count),
                metadata: serde_json::to_value(LowAttendanceMetadata {
                    session_id: session.id,
                    topic_id: session.topic_id,
                    attendee_count,
                })
                .unwrap(),
                detected_at: Utc::now(),
            });
        }

        Ok(insights)
    }

    async fn get_difficult_topics(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let progress_records = ProgressEntity::find()
            .filter(ProgressColumn::LastAccessedAt.gte(start))
            .filter(ProgressColumn::LastAccessedAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if progress_records.is_empty() {
            return Ok(vec![]);
        }

        let mut topic_progress: std::collections::HashMap<Uuid, (i64, f64)> =
            std::collections::HashMap::new();

        for record in &progress_records {
            let entry = topic_progress.entry(record.topic_id).or_insert((0, 0.0));
            entry.0 += 1;
            entry.1 += record.progress_percent as f64;
        }

        let mut insights = vec![];

        for (topic_id, (count, total_progress)) in topic_progress {
            let avg_progress = total_progress / count as f64;

            if avg_progress < 60.0 {
                let severity = if avg_progress < 20.0 {
                    Severity::Warning
                } else {
                    Severity::Info
                };

                insights.push(Insight {
                    id: Uuid::new_v4(),
                    insight_type: InsightType::TopicDifficulty,
                    severity,
                    title: "Students struggling with topic".to_string(),
                    description: format!("Average progress: {:.1}%", avg_progress),
                    metadata: serde_json::to_value(TopicDifficultyMetadata {
                        topic_id,
                        avg_progress,
                        attempt_count: count,
                    })
                    .unwrap(),
                    detected_at: Utc::now(),
                });
            }
        }

        Ok(insights)
    }

    async fn get_low_engagement_topics(
        &self,
        start: DateTime<Utc>,
        end: DateTime<Utc>,
    ) -> Result<Vec<Insight>, AppError> {
        let progress_records = ProgressEntity::find()
            .filter(ProgressColumn::LastAccessedAt.gte(start))
            .filter(ProgressColumn::LastAccessedAt.lte(end))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        if progress_records.is_empty() {
            return Ok(vec![]);
        }

        let mut topic_users: std::collections::HashMap<Uuid, std::collections::HashSet<Uuid>> =
            std::collections::HashMap::new();

        for record in &progress_records {
            topic_users
                .entry(record.topic_id)
                .or_default()
                .insert(record.user_id);
        }

        let mut insights = vec![];

        for (topic_id, users) in topic_users {
            let active_users = users.len() as i64;

            if active_users < 10 {
                let severity = if active_users == 0 {
                    Severity::Warning
                } else {
                    Severity::Info
                };

                insights.push(Insight {
                    id: Uuid::new_v4(),
                    insight_type: InsightType::LowEngagement,
                    severity,
                    title: "Low engagement on topic".to_string(),
                    description: format!("Only {} students accessed this topic", active_users),
                    metadata: serde_json::to_value(LowEngagementMetadata {
                        topic_id,
                        active_users,
                    })
                    .unwrap(),
                    detected_at: Utc::now(),
                });
            }
        }

        Ok(insights)
    }

    async fn get_topic_performance(
        &self,
        subject_id: Option<Uuid>,
        chapter_id: Option<Uuid>,
        topic_id: Option<Uuid>,
    ) -> Result<Vec<TopicPerformance>, AppError> {
        let mut topic_query = TopicEntity::find();

        if let Some(tid) = topic_id {
            topic_query = topic_query.filter(TopicColumn::Id.eq(tid));
        }
        if let Some(cid) = chapter_id {
            topic_query = topic_query.filter(TopicColumn::ChapterId.eq(cid));
        }

        let topics = topic_query
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let topic_ids: Vec<Uuid> = topics.iter().map(|t| t.id).collect();

        if topic_ids.is_empty() {
            return Ok(vec![]);
        }

        let chapters = ChapterEntity::find()
            .filter(
                ChapterColumn::Id.is_in(topics.iter().map(|t| t.chapter_id).collect::<Vec<Uuid>>()),
            )
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let chapter_map: std::collections::HashMap<Uuid, &ChapterModel> =
            chapters.iter().map(|c| (c.id, c)).collect();

        let subject_ids: Vec<Uuid> = chapters.iter().map(|c| c.subject_id).collect();
        let subjects = SubjectEntity::find()
            .filter(SubjectColumn::Id.is_in(subject_ids))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let subject_map: std::collections::HashMap<Uuid, &SubjectModel> =
            subjects.iter().map(|s| (s.id, s)).collect();

        let progress_records = ProgressEntity::find()
            .filter(ProgressColumn::TopicId.is_in(topic_ids.clone()))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let recall_sessions = RecallSessionEntity::find()
            .filter(RecallSessionColumn::TopicId.is_in(topic_ids.clone()))
            .filter(RecallSessionColumn::Status.eq(LearningRecallSessionStatusEnum::COMPLETED))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let session_ids: Vec<Uuid> = recall_sessions.iter().map(|s| s.id).collect();
        let recall_answers = if !session_ids.is_empty() {
            RecallAnswerEntity::find()
                .filter(RecallAnswerColumn::SessionId.is_in(session_ids))
                .all(&*self.db)
                .await
                .map_err(AppError::Database)?
        } else {
            vec![]
        };

        let mut topic_students: std::collections::HashMap<Uuid, std::collections::HashSet<Uuid>> =
            std::collections::HashMap::new();
        let mut topic_answers: std::collections::HashMap<Uuid, Vec<RecallAnswerModel>> =
            std::collections::HashMap::new();

        for progress in &progress_records {
            topic_students
                .entry(progress.topic_id)
                .or_default()
                .insert(progress.user_id);
        }

        let session_topic_map: std::collections::HashMap<Uuid, Uuid> =
            recall_sessions.iter().map(|s| (s.id, s.topic_id)).collect();

        for answer in &recall_answers {
            if let Some(topic_id) = session_topic_map.get(&answer.session_id) {
                topic_answers
                    .entry(*topic_id)
                    .or_default()
                    .push(answer.clone());
            }
        }

        let mut performances = vec![];

        for topic in &topics {
            let topic_id = topic.id;
            let chapter = chapter_map.get(&topic.chapter_id);
            let topic_subject_id = chapter.map(|c| c.subject_id);

            if let Some(sid) = subject_id {
                if let Some(tsid) = topic_subject_id {
                    if sid != tsid {
                        continue;
                    }
                } else {
                    continue;
                }
            }

            let students = topic_students.get(&topic_id).cloned().unwrap_or_default();
            let total_students = students.len() as i64;

            let answers = topic_answers.get(&topic_id).cloned().unwrap_or_default();

            let recall_strength_mcq = calculate_mcq_strength(&answers);
            let recall_strength_reflection = calculate_reflection_strength(&answers);
            let practice_accuracy = calculate_combined_accuracy(&answers);

            let students_affected = if practice_accuracy < 50.0 && total_students > 0 {
                total_students
            } else {
                0
            };

            let chapter_name = chapter
                .map(|c| c.name.clone())
                .unwrap_or_else(|| "Unknown".to_string());
            let subject_name = topic_subject_id
                .and_then(|sid| subject_map.get(&sid))
                .map(|s| s.name.clone())
                .unwrap_or_else(|| "Unknown".to_string());

            performances.push(TopicPerformance {
                topic_id,
                subject_id: topic_subject_id.unwrap_or(topic_id),
                topic_name: topic.name.clone(),
                chapter_name,
                subject_name,
                recall_strength_mcq,
                recall_strength_reflection,
                practice_accuracy,
                students_affected,
                total_students,
            });
        }

        Ok(performances)
    }
}

pub fn calculate_mcq_strength(answers: &[RecallAnswerModel]) -> Option<f64> {
    let mcq_answers: Vec<_> = answers
        .iter()
        .filter(|a| a.question_type == LearningRecallQuestionTypeEnum::MCQ)
        .collect();

    if mcq_answers.is_empty() {
        return None;
    }

    let correct_count = mcq_answers.iter().filter(|a| a.is_correct).count() as f64;
    Some((correct_count / mcq_answers.len() as f64) * 100.0)
}

pub fn calculate_reflection_strength(answers: &[RecallAnswerModel]) -> Option<f64> {
    let reflection_answers: Vec<_> = answers
        .iter()
        .filter(|a| a.question_type == LearningRecallQuestionTypeEnum::REFLECTION)
        .collect();

    if reflection_answers.is_empty() {
        return None;
    }

    let total_score: i32 = reflection_answers.iter().filter_map(|a| a.score).sum();
    let max_possible = reflection_answers.len() as i32 * 100;

    if max_possible == 0 {
        return None;
    }

    Some((total_score as f64 / max_possible as f64) * 100.0)
}

pub fn calculate_combined_accuracy(answers: &[RecallAnswerModel]) -> f64 {
    if answers.is_empty() {
        return 0.0;
    }

    let correct_mcq = answers
        .iter()
        .filter(|a| a.question_type == LearningRecallQuestionTypeEnum::MCQ && a.is_correct)
        .count();

    let scored_reflection: Vec<_> = answers
        .iter()
        .filter(|a| {
            a.question_type == LearningRecallQuestionTypeEnum::REFLECTION && a.score.is_some()
        })
        .collect();

    let passing_reflection = scored_reflection
        .iter()
        .filter(|a| a.score.unwrap_or(0) >= 50)
        .count();

    let total = correct_mcq + passing_reflection;
    (total as f64 / answers.len() as f64) * 100.0
}

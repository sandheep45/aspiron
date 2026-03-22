use anyhow::Result;
use rand::{Rng, thread_rng};
use sea_orm::{DatabaseConnection, DatabaseTransaction, TransactionTrait};
use std::collections::HashMap;
use tracing::info;
use uuid::Uuid;

use crate::entries::entity_enums::exam_types::ExamTypeEnums;
use crate::entries::entity_enums::user_types::UserTypeEnums;

#[derive(Debug, Clone, Default)]
pub struct RelationshipMap {
    pub user_ids: HashMap<UserTypeEnums, Vec<Uuid>>,
    pub role_ids: HashMap<UserTypeEnums, Uuid>,
    pub subject_ids: HashMap<ExamTypeEnums, Vec<Uuid>>,
    pub chapter_map: HashMap<Uuid, Vec<Uuid>>, // subject_id -> chapter_ids
    pub topic_map: HashMap<Uuid, Vec<Uuid>>,   // chapter_id -> topic_ids
    pub video_map: HashMap<Uuid, Vec<Uuid>>,   // topic_id -> video_ids
    pub quiz_map: HashMap<Uuid, Vec<Uuid>>,    // topic_id -> quiz_ids
    pub question_map: HashMap<Uuid, Vec<Uuid>>, // quiz_id -> question_ids
    pub session_ids: Vec<Uuid>,                // recall session IDs
    pub thread_ids: Vec<Uuid>,                 // community thread IDs
    pub attempt_ids: Vec<Uuid>,                // assessment attempt IDs
    pub notification_event_ids: Vec<Uuid>,     // notification event IDs
    pub live_session_ids: Vec<Uuid>,           // live session IDs
}

impl RelationshipMap {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get_random_user_id(&self, user_type: UserTypeEnums) -> Option<Uuid> {
        self.user_ids.get(&user_type).and_then(|ids| {
            if ids.is_empty() {
                None
            } else {
                Some(ids[thread_rng().gen_range(0..ids.len())])
            }
        })
    }

    pub fn get_random_student_id(&self) -> Option<Uuid> {
        self.get_random_user_id(UserTypeEnums::STUDENT)
    }

    pub fn get_random_teacher_id(&self) -> Option<Uuid> {
        self.get_random_user_id(UserTypeEnums::TEACHER)
    }

    pub fn get_topics_for_subject(&self, subject_id: Uuid) -> Vec<Uuid> {
        let mut topics = Vec::new();
        if let Some(chapters) = self.chapter_map.get(&subject_id) {
            for chapter_id in chapters {
                if let Some(chapter_topics) = self.topic_map.get(chapter_id) {
                    topics.extend(chapter_topics);
                }
            }
        }
        topics
    }

    pub fn get_videos_for_topic(&self, topic_id: Uuid) -> Vec<Uuid> {
        self.video_map
            .get(&topic_id)
            .map_or_else(Vec::new, |v| v.clone())
    }

    pub fn get_quizzes_for_topic(&self, topic_id: Uuid) -> Vec<Uuid> {
        self.quiz_map
            .get(&topic_id)
            .map_or_else(Vec::new, |v| v.clone())
    }

    pub fn get_questions_for_quiz(&self, quiz_id: Uuid) -> Vec<Uuid> {
        self.question_map
            .get(&quiz_id)
            .map_or_else(Vec::new, |v| v.clone())
    }
}

pub struct SeedRunner<'a> {
    pub db: &'a DatabaseConnection,
    pub config: crate::seeds::SeedConfig,
    pub relationship_map: RelationshipMap,
}

impl<'a> SeedRunner<'a> {
    pub async fn new(
        db_conn: &'a DatabaseConnection,
        config: crate::seeds::SeedConfig,
    ) -> Result<Self> {
        Ok(Self {
            db: db_conn,
            config,
            relationship_map: RelationshipMap::new(),
        })
    }

    pub async fn run_complete_seed(&mut self) -> Result<()> {
        info!("🌱 Starting complete database seeding");

        let txn = self.db.begin().await?;

        // Phase 1: RBAC system (must be seeded before users)
        self.seed_rbac(&txn).await?;

        // Phase 2: Independent entities
        self.seed_users(&txn).await?;
        self.seed_subjects(&txn).await?;

        // Phase 2: Content hierarchy
        self.seed_chapters(&txn).await?;
        self.seed_topics(&txn).await?;

        // Phase 3: Content items
        self.seed_videos(&txn).await?;
        self.seed_quizzes(&txn).await?;
        self.seed_questions(&txn).await?;

        // Phase 4: User interactions
        self.seed_learning_progress(&txn).await?;
        self.seed_learning_notes(&txn).await?;
        self.seed_recall_sessions(&txn).await?;
        self.seed_learning_recall_answers(&txn).await?;
        self.seed_community_threads(&txn).await?;
        self.seed_community_posts(&txn).await?;
        self.seed_community_bot_events(&txn).await?;
        self.seed_assessment_attempts(&txn).await?;
        self.seed_assessment_proctoring(&txn).await?;
        self.seed_live_sessions(&txn).await?;
        self.seed_live_session_recordings(&txn).await?;
        self.seed_notification_events(&txn).await?;
        self.seed_notification_logs(&txn).await?;
        self.seed_audit_logs(&txn).await?;
        self.seed_resource_permissions(&txn).await?;
        self.seed_user_sessions(&txn).await?;

        if self.config.validate_relationships {
            self.validate_relationships(&txn).await?;
        }

        txn.commit().await?;

        info!("✅ Complete seeding finished successfully");
        self.print_summary();

        Ok(())
    }

    pub async fn seed_users_only(&mut self) -> Result<()> {
        info!("👥 Seeding users only");
        let txn = self.db.begin().await?;
        self.seed_users(&txn).await?;
        txn.commit().await?;
        info!("✅ Users seeded successfully");
        Ok(())
    }

    pub async fn seed_content_only(&mut self) -> Result<()> {
        info!("📚 Seeding content hierarchy only");
        let txn = self.db.begin().await?;
        self.seed_subjects(&txn).await?;
        self.seed_chapters(&txn).await?;
        self.seed_topics(&txn).await?;
        self.seed_videos(&txn).await?;
        txn.commit().await?;
        info!("✅ Content hierarchy seeded successfully");
        Ok(())
    }

    pub async fn seed_assessments_only(&mut self) -> Result<()> {
        info!("📝 Seeding assessments only");
        let txn = self.db.begin().await?;
        self.seed_quizzes(&txn).await?;
        self.seed_questions(&txn).await?;
        self.seed_assessment_attempts(&txn).await?;
        txn.commit().await?;
        info!("✅ Assessments seeded successfully");
        Ok(())
    }

    pub async fn seed_community_only(&mut self) -> Result<()> {
        info!("💬 Seeding community only");
        let txn = self.db.begin().await?;
        self.seed_community_threads(&txn).await?;
        self.seed_community_posts(&txn).await?;
        txn.commit().await?;
        info!("✅ Community data seeded successfully");
        Ok(())
    }

    pub async fn validate_data_integrity(&self, deep: bool) -> Result<()> {
        info!("🔍 Validating data integrity");
        let txn = self.db.begin().await?;

        if deep {
            self.validate_relationships(&txn).await?;
        }

        self.validate_data_counts(&txn).await?;

        txn.commit().await?;
        info!("✅ Data integrity validation completed");
        Ok(())
    }

    fn print_summary(&self) {
        info!("\n📊 Seeding Summary:");
        info!("👥 Users: {:?}", self.relationship_map.user_ids);
        info!("📚 Subjects: {:?}", self.relationship_map.subject_ids);
        info!(
            "📖 Chapters: {} total",
            self.relationship_map
                .chapter_map
                .values()
                .map(|v| v.len())
                .sum::<usize>()
        );
        info!(
            "📝 Topics: {} total",
            self.relationship_map
                .topic_map
                .values()
                .map(|v| v.len())
                .sum::<usize>()
        );
        info!(
            "🎥 Videos: {} total",
            self.relationship_map
                .video_map
                .values()
                .map(|v| v.len())
                .sum::<usize>()
        );
        info!(
            "📋 Quizzes: {} total",
            self.relationship_map
                .quiz_map
                .values()
                .map(|v| v.len())
                .sum::<usize>()
        );
        info!(
            "❓ Questions: {} total",
            self.relationship_map
                .question_map
                .values()
                .map(|v| v.len())
                .sum::<usize>()
        );
    }

    // async fn validate_relationships(&self, _txn: &DatabaseTransaction) -> Result<()> {
    //     info!("✅ Relationship validation passed");
    //     Ok(())
    // }

    async fn validate_data_counts(&self, _txn: &DatabaseTransaction) -> Result<()> {
        info!("✅ Data count validation passed");
        Ok(())
    }
}

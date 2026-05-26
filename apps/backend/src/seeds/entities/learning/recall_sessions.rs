use anyhow::Result;
use chrono::{Duration, Utc};
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::learning_recall_session;
use crate::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;
use crate::entries::entity_enums::user_types::UserTypeEnums;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_recall_sessions(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🧠 Seeding recall sessions...");
        }

        let student_ids = self
            .relationship_map
            .user_ids
            .get(&UserTypeEnums::STUDENT)
            .cloned()
            .unwrap_or_default();

        if student_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No students found, skipping recall sessions");
            }
            return Ok(());
        }

        let mut rng = rand::thread_rng();
        let mut all_session_ids = Vec::new();

        let active_topic_ids = &self.relationship_map.active_topic_ids;

        // First pass: guarantee every active topic has at least one session
        for topic_id in active_topic_ids.iter() {
            let student_id = student_ids[rng.gen_range(0..student_ids.len())];
            let started_at = Utc::now() - Duration::days(rng.gen_range(0..30));
            let session_model = learning_recall_session::ActiveModel {
                id: Set(Uuid::new_v4()),
                user_id: Set(student_id),
                topic_id: Set(*topic_id),
                status: Set(LearningRecallSessionStatusEnum::COMPLETED),
                started_at: Set(started_at.into()),
                completed_at: Set(Some(
                    (started_at + Duration::minutes(rng.gen_range(5..30))).into(),
                )),
            };
            let session = session_model.insert(txn).await?;
            all_session_ids.push(session.id);
        }

        // Second pass: distribute remaining random sessions across students
        let remaining_sessions_per_student = rng.gen_range(2..5);
        for student_id in student_ids.iter() {
            for _ in 0..remaining_sessions_per_student {
                let topic_id = if active_topic_ids.is_empty() {
                    Uuid::new_v4()
                } else {
                    active_topic_ids[rng.gen_range(0..active_topic_ids.len())]
                };

                let started_at = Utc::now() - Duration::days(rng.gen_range(0..30));
                let session_model = learning_recall_session::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    user_id: Set(*student_id),
                    topic_id: Set(topic_id),
                    status: Set(LearningRecallSessionStatusEnum::COMPLETED),
                    started_at: Set(started_at.into()),
                    completed_at: Set(Some(
                        (started_at + Duration::minutes(rng.gen_range(5..30))).into(),
                    )),
                };

                let session = session_model.insert(txn).await?;
                all_session_ids.push(session.id);
            }
        }

        self.relationship_map.session_ids = all_session_ids;

        if self.config.show_progress {
            println!(
                "✅ Seeded {} recall sessions",
                self.relationship_map.session_ids.len()
            );
        }

        Ok(())
    }
}

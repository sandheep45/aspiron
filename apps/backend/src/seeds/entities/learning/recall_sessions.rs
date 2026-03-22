use anyhow::Result;
use chrono::{Duration, Utc};
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::learning_recall_session;
use crate::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_recall_sessions(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🧠 Seeding recall sessions...");
        }

        let student_ids = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entity_enums::user_types::UserTypeEnums::STUDENT)
            .cloned()
            .unwrap_or_default();

        let mut rng = rand::thread_rng();
        let mut all_session_ids = Vec::new();

        let all_topic_ids: Vec<Uuid> = self
            .relationship_map
            .topic_map
            .values()
            .flat_map(|v| v.iter())
            .copied()
            .collect();

        for student_id in student_ids.iter() {
            let num_sessions = rng.gen_range(2..5);

            for _ in 0..num_sessions {
                let topic_id = if all_topic_ids.is_empty() {
                    Uuid::new_v4()
                } else {
                    all_topic_ids[rng.gen_range(0..all_topic_ids.len())]
                };

                let started_at = Utc::now() - Duration::days(rng.gen_range(0..30));
                let is_completed = rng.gen_bool(0.7);

                let session_model = learning_recall_session::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    user_id: Set(*student_id),
                    topic_id: Set(topic_id),
                    status: Set(if is_completed {
                        LearningRecallSessionStatusEnum::COMPLETED
                    } else {
                        LearningRecallSessionStatusEnum::PENDING
                    }),
                    started_at: Set(started_at.into()),
                    completed_at: Set(if is_completed {
                        Some((started_at + Duration::minutes(rng.gen_range(5..30))).into())
                    } else {
                        None
                    }),
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

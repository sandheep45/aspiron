use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::learning_progress;
use crate::entries::entity_enums::exam_types::ExamTypeEnums;
use crate::entries::entity_enums::user_types::UserTypeEnums;
use crate::seeds::runner::SeedRunner;
use crate::seeds::utils::generators::generate_random_progress_percentage;

impl<'a> SeedRunner<'a> {
    pub async fn seed_learning_progress(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📈 Seeding learning progress...");
        }

        let mut active_topic_ids = Vec::new();
        if let Some(subject_ids) = self.relationship_map.subject_ids.get(&ExamTypeEnums::JEE) {
            for subject_id in subject_ids {
                let topics = self.relationship_map.get_topics_for_subject(*subject_id);
                active_topic_ids.extend(topics.iter().take(10));
            }
        }
        self.relationship_map.active_topic_ids = active_topic_ids.clone();

        if let Some(student_ids) = self.relationship_map.user_ids.get(&UserTypeEnums::STUDENT) {
            for student_id in student_ids {
                for topic_id in &active_topic_ids {
                    let progress_model = learning_progress::ActiveModel {
                        id: Set(Uuid::new_v4()),
                        topic_id: Set(*topic_id),
                        user_id: Set(*student_id),
                        progress_percent: Set(generate_random_progress_percentage()),
                        last_accessed_at: Set(chrono::Utc::now().into()),
                    };

                    progress_model.insert(txn).await?;
                }
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded learning progress");
        }

        Ok(())
    }
}

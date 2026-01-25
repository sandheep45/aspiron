use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::learning_progress;
use crate::seeds::runner::SeedRunner;
use crate::seeds::utils::generators::generate_random_progress_percentage;

impl<'a> SeedRunner<'a> {
    pub async fn seed_learning_progress(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📈 Seeding learning progress...");
        }

        // Create progress for student users across topics
        let _student_ids = self.relationship_map.get_random_student_id();

        if let Some(student_ids) = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entitiy_enums::user_types::UserTypeEnums::STUDENT)
        {
            for student_id in student_ids {
                let topics = self.relationship_map.get_topics_for_subject(
                    *self
                        .relationship_map
                        .subject_ids
                        .get(&crate::entries::entitiy_enums::exam_types::ExamTypeEnums::JEE)
                        .unwrap_or(&vec![])
                        .first()
                        .unwrap(),
                );

                for topic_id in topics.iter().take(10) {
                    // Each student has progress in 10 topics
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

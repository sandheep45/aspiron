use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::assessment_attempt;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_assessment_attempts(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📊 Seeding assessment attempts...");
        }

        let student_ids = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entity_enums::user_types::UserTypeEnums::STUDENT)
            .cloned()
            .unwrap_or_default();

        if student_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No students found, skipping assessment attempts");
            }
            return Ok(());
        }

        let all_quiz_ids: Vec<Uuid> = self
            .relationship_map
            .quiz_map
            .values()
            .flatten()
            .copied()
            .collect();

        if all_quiz_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No quizzes found, skipping assessment attempts");
            }
            return Ok(());
        }

        let mut all_attempt_ids = Vec::new();
        let mut attempts_count = 0;

        for (quiz_idx, quiz_id) in all_quiz_ids.iter().enumerate().take(30) {
            let student_id = student_ids[quiz_idx % student_ids.len()];

            let attempt_id = Uuid::new_v4();
            let attempt_model = assessment_attempt::ActiveModel {
                id: Set(attempt_id),
                started_at: Set(chrono::Utc::now().into()),
                submitted_at: Set(Some(chrono::Utc::now().into())),
                quiz_id: Set(*quiz_id),
                user_id: Set(student_id),
                score: Set(60 + rand::random::<i32>() % 40),
            };

            attempt_model.insert(txn).await?;
            all_attempt_ids.push(attempt_id);
            attempts_count += 1;
        }

        self.relationship_map.attempt_ids = all_attempt_ids;

        if self.config.show_progress {
            println!("✅ Seeded {} assessment attempts", attempts_count);
        }

        Ok(())
    }
}

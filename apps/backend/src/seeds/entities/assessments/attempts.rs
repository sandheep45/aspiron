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

        // Create attempts for 10 students across quizzes
        let student_ids = if let Some(ids) = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entitiy_enums::user_types::UserTypeEnums::STUDENT)
        {
            ids
        } else {
            &vec![]
        };

        for student_id in student_ids.iter().take(10) {
            // Get random quizzes for this student
            let topics = self.relationship_map.get_topics_for_subject(
                *self
                    .relationship_map
                    .subject_ids
                    .get(&crate::entries::entitiy_enums::exam_types::ExamTypeEnums::JEE)
                    .unwrap_or(&vec![])
                    .first()
                    .unwrap(),
            );

            for quiz_idx in 0..3.min(topics.len() / 2) {
                // Each student attempts 3-5 quizzes
                if let Some(topic_id) = topics.get(quiz_idx * 2) {
                    let quiz_ids = self.relationship_map.get_quizzes_for_topic(*topic_id);

                    if let Some(quiz_id) = quiz_ids.first() {
                        let attempt_model = assessment_attempt::ActiveModel {
                            id: Set(Uuid::new_v4()),
                            started_at: Set(chrono::Utc::now().into()),
                            submitted_at: Set(Some(chrono::Utc::now().into())), // fixed
                            quiz_id: Set(*quiz_id),
                            user_id: Set(*student_id),
                            score: Set(60 + rand::random::<i32>() % 40), // 60-99%
                        };

                        attempt_model.insert(txn).await?;
                    }
                }
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded assessment attempts");
        }

        Ok(())
    }
}

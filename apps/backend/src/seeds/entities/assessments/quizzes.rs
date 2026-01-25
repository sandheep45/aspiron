use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::assessment_quiz;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_quizzes(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📋 Seeding quizzes...");
        }

        let mut quiz_map = std::collections::HashMap::new();

        // For each topic, create 1 quiz (5 per subject)
        for subject_ids in self.relationship_map.subject_ids.values() {
            for subject_id in subject_ids {
                let topics = self.relationship_map.get_topics_for_subject(*subject_id);

                // Create 5 quizzes per subject (1 per selected topic)
                for quiz_num in 1..=5 {
                    // Select a random topic for this quiz
                    if let Some(topic_id) = topics.get(quiz_num * topics.len() / 5) {
                        let quiz_id = Uuid::new_v4();
                        let quiz_title = format!(
                            "Quiz {}: {} Assessment",
                            quiz_num,
                            [
                                "Basic",
                                "Intermediate",
                                "Advanced",
                                "Comprehensive",
                                "Final"
                            ][rand::random::<usize>() % 5]
                        );

                        let quiz_model = assessment_quiz::ActiveModel {
                            id: Set(quiz_id),
                            topic_id: Set(*topic_id),
                            title: Set(quiz_title),
                        };

                        quiz_model.insert(txn).await?;

                        quiz_map
                            .entry(*topic_id)
                            .or_insert_with(Vec::new)
                            .push(quiz_id);
                    }
                }
            }
        }

        self.relationship_map.quiz_map = quiz_map;

        if self.config.show_progress {
            println!("✅ Seeded quizzes");
        }

        Ok(())
    }
}

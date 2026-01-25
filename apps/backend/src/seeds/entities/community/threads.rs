use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::community_thread;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_community_threads(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🧵 Seeding community threads...");
        }

        // Create 10 threads per subject
        for subject_ids in self.relationship_map.subject_ids.values() {
            for subject_id in subject_ids {
                let topics = self.relationship_map.get_topics_for_subject(*subject_id);

                for thread_num in 1..=10 {
                    if let Some(topic_id) = topics.get(thread_num * topics.len() / 10) {
                        let user_id = if thread_num <= 5 {
                            // First 5 threads by teachers
                            self.relationship_map.get_random_teacher_id().unwrap()
                        } else {
                            // Remaining threads by students
                            self.relationship_map.get_random_student_id().unwrap()
                        };

                        let thread_id = Uuid::new_v4();
                        let thread_title = format!(
                            "Thread {}: {} Discussion",
                            thread_num,
                            ["Help with", "Question about", "Doubt in", "Tips for"]
                                [rand::random::<usize>() % 4]
                        );

                        let thread_model = community_thread::ActiveModel {
                            id: Set(thread_id),
                            user_id: Set(user_id),
                            topic_id: Set(*topic_id),
                            title: Set(thread_title),
                            created_at: Set(chrono::Utc::now().into()),
                        };

                        thread_model.insert(txn).await?;
                    }
                }
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded community threads");
        }

        Ok(())
    }
}

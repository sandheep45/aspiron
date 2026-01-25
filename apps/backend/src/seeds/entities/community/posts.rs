use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::community_post;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_community_posts(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("💬 Seeding community posts...");
        }

        // Create 2-3 posts per thread
        let topics = self.relationship_map.get_topics_for_subject(
            *self
                .relationship_map
                .subject_ids
                .get(&crate::entries::entitiy_enums::exam_types::ExamTypeEnums::JEE)
                .unwrap_or(&vec![])
                .first()
                .unwrap(),
        );

        for _topic_id in topics.iter().take(5) {
            // Sample 5 topics for posts
            // Create actual threads for posts
            let thread_ids: Vec<Uuid> = (0..2).map(|_| Uuid::new_v4()).collect();

            // First, insert the threads into the database
            for thread_id in &thread_ids {
                let user_id = self.relationship_map.get_random_student_id().unwrap();
                let thread_model = crate::entries::entities::community_thread::ActiveModel {
                    id: Set(*thread_id),
                    user_id: Set(user_id),
                    topic_id: Set(*_topic_id),
                    title: Set(format!("Discussion thread for topic {}", _topic_id)),
                    created_at: Set(chrono::Utc::now().into()),
                };
                thread_model.insert(txn).await?;
            }

            for post_num in 1..=3 {
                let user_id = self.relationship_map.get_random_student_id().unwrap();
                let thread_id = thread_ids[post_num % thread_ids.len()];

                let post_id = Uuid::new_v4();
                let post_content = match post_num {
                    1 => "This is a helpful explanation of the concept.",
                    2 => "I have the same doubt. Can someone clarify?",
                    3 => "Here's a tip that helped me understand this better.",
                    _ => "Thanks for the explanation! This makes sense now.",
                };

                let post_model = community_post::ActiveModel {
                    id: Set(post_id),
                    user_id: Set(user_id),
                    thread_id: Set(thread_id),
                    content: Set(post_content.to_string()),
                    created_at: Set(chrono::Utc::now().into()),
                };

                post_model.insert(txn).await?;
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded community posts");
        }

        Ok(())
    }
}

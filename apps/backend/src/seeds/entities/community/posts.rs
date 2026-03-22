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

        let topic_ids = self.relationship_map.get_topics_for_subject(
            *self
                .relationship_map
                .subject_ids
                .get(&crate::entries::entity_enums::exam_types::ExamTypeEnums::JEE)
                .unwrap_or(&vec![])
                .first()
                .unwrap_or(&Uuid::nil()),
        );

        let thread_ids = if self.relationship_map.thread_ids.is_empty() {
            let mut new_thread_ids = Vec::new();

            for topic_id in topic_ids.iter().take(10) {
                let user_id = self.relationship_map.get_random_student_id().unwrap();
                let thread_id = Uuid::new_v4();

                let thread_model = crate::entries::entities::community_thread::ActiveModel {
                    id: Set(thread_id),
                    user_id: Set(user_id),
                    topic_id: Set(*topic_id),
                    title: Set(format!("Discussion thread for topic {}", topic_id)),
                    created_at: Set(chrono::Utc::now().into()),
                };
                thread_model.insert(txn).await?;
                new_thread_ids.push(thread_id);
            }

            new_thread_ids
        } else {
            self.relationship_map.thread_ids.clone()
        };

        if thread_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No community threads found, skipping posts");
            }
            return Ok(());
        }

        for post_num in 0..30 {
            let user_id = self.relationship_map.get_random_student_id().unwrap();
            let thread_id = thread_ids[post_num % thread_ids.len()];

            let post_content = match post_num % 3 {
                0 => "This is a helpful explanation of the concept.",
                1 => "I have the same doubt. Can someone clarify?",
                2 => "Here's a tip that helped me understand this better.",
                _ => "Thanks for the explanation! This makes sense now.",
            };

            let post_model = community_post::ActiveModel {
                id: Set(Uuid::new_v4()),
                user_id: Set(user_id),
                thread_id: Set(thread_id),
                content: Set(post_content.to_string()),
                created_at: Set(chrono::Utc::now().into()),
            };

            post_model.insert(txn).await?;
        }

        if self.config.show_progress {
            println!("✅ Seeded community posts");
        }

        Ok(())
    }
}

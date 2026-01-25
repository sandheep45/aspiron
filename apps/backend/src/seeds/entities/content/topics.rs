use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::content_topic;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_topics(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📝 Seeding topics...");
        }

        let mut topic_map = std::collections::HashMap::new();

        // For each chapter, create 10 topics
        for chapter_ids in self.relationship_map.chapter_map.values() {
            for chapter_id in chapter_ids {
                let mut topic_ids = Vec::new();

                for topic_num in 1..=10 {
                    let topic_id = Uuid::new_v4();
                    let topic_name = format!("Topic {}", topic_num);

                    let topic_model = content_topic::ActiveModel {
                        id: Set(topic_id),
                        name: Set(topic_name),
                        chapter_id: Set(*chapter_id),
                        order_number: Set(topic_num),
                    };

                    topic_model.insert(txn).await?;
                    topic_ids.push(topic_id);
                }

                topic_map.insert(*chapter_id, topic_ids);
            }
        }

        self.relationship_map.topic_map = topic_map;

        if self.config.show_progress {
            println!("✅ Seeded 750 topics (10 per chapter)");
        }

        Ok(())
    }
}

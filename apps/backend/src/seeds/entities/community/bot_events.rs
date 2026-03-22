use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use serde_json::json;
use uuid::Uuid;

use crate::entries::entities::community_bot_event;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_community_bot_events(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🤖 Seeding community bot events...");
        }

        let event_types = [
            "message_received",
            "auto_reply",
            "moderation_action",
            "user_mention",
            "spam_detected",
        ];

        let thread_ids = &self.relationship_map.thread_ids;

        if thread_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No community threads found, skipping bot events");
            }
            return Ok(());
        }

        let mut rng = rand::thread_rng();

        for i in 0..30 {
            let thread_id = thread_ids[i % thread_ids.len()];
            let event_type = event_types[i % event_types.len()];
            let payload = json!({
                "message_id": Uuid::new_v4().to_string(),
                "user_id": Uuid::new_v4().to_string(),
                "content": format!("Bot event #{}", i),
                "confidence": rng.gen_range(0.5..1.0),
            });

            let bot_event_model = community_bot_event::ActiveModel {
                id: Set(Uuid::new_v4()),
                thread_id: Set(thread_id),
                event_type: Set(event_type.to_string()),
                payload: Set(payload),
                created_at: Set(chrono::Utc::now().into()),
            };

            bot_event_model.insert(txn).await?;
        }

        if self.config.show_progress {
            println!("✅ Seeded community bot events");
        }

        Ok(())
    }
}

use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use serde_json::json;
use uuid::Uuid;

use crate::entries::entities::notification_event;
use crate::entries::entity_enums::notification_event_type::NotificationEventTypeEnum;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_notification_events(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🔔 Seeding notification events...");
        }

        let event_types = [
            NotificationEventTypeEnum::RECALL,
            NotificationEventTypeEnum::PROGRESS,
            NotificationEventTypeEnum::SYSTEM,
        ];

        let user_ids = self
            .relationship_map
            .user_ids
            .values()
            .flatten()
            .collect::<Vec<_>>();

        let mut all_event_ids = Vec::new();

        for (idx, user_id) in user_ids.iter().enumerate().take(40) {
            let user_uuid = **user_id;
            let event_type = &event_types[idx % event_types.len()];
            let event_type_str = format!("{:?}", event_type);
            let payload = match event_type {
                NotificationEventTypeEnum::RECALL => {
                    json!({
                        "title": "Time to recall!",
                        "message": "Review your flashcards",
                        "session_id": Uuid::new_v4().to_string(),
                    })
                }
                NotificationEventTypeEnum::PROGRESS => {
                    json!({
                        "title": "Progress Update",
                        "message": "You've completed 75% of this topic",
                        "topic_id": Uuid::new_v4().to_string(),
                    })
                }
                NotificationEventTypeEnum::SYSTEM => {
                    json!({
                        "title": "System Notification",
                        "message": "Scheduled maintenance in 24 hours",
                    })
                }
            };

            let scheduled_at = chrono::Utc::now()
                .checked_add_signed(chrono::Duration::hours(idx as i64))
                .unwrap();

            let event_id = Uuid::new_v4();
            let event_model = notification_event::ActiveModel {
                id: Set(event_id),
                user_id: Set(user_uuid),
                payload: Set(payload),
                r#type: Set(event_type_str),
                scheduled_at: Set(scheduled_at.into()),
            };

            event_model.insert(txn).await?;
            all_event_ids.push(event_id);
        }

        self.relationship_map.notification_event_ids = all_event_ids;

        if self.config.show_progress {
            println!("✅ Seeded notification events");
        }

        Ok(())
    }
}

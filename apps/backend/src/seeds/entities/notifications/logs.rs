use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::notification_log;
use crate::entries::entity_enums::notification_logs_types::NotificationLogsTypesEnum;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_notification_logs(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📝 Seeding notification logs...");
        }

        let event_ids = &self.relationship_map.notification_event_ids;

        if event_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No notification events found, skipping logs");
            }
            return Ok(());
        }

        for i in 0..50 {
            let status = if i % 10 == 9 {
                NotificationLogsTypesEnum::FAILED
            } else if i % 15 == 14 {
                NotificationLogsTypesEnum::SKIPPED
            } else {
                NotificationLogsTypesEnum::SENT
            };

            let sent_at = chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::hours(i as i64))
                .unwrap();

            let event_id = event_ids[i % event_ids.len()];

            let log_model = notification_log::ActiveModel {
                id: Set(Uuid::new_v4()),
                event_id: Set(event_id),
                status: Set(status),
                sent_at: Set(sent_at.into()),
            };

            log_model.insert(txn).await?;
        }

        if self.config.show_progress {
            println!("✅ Seeded notification logs");
        }

        Ok(())
    }
}

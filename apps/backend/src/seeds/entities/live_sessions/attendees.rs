use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::live_session_attendee;
use crate::entries::entity_enums::user_types::UserTypeEnums;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_live_session_attendees(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("👥 Seeding live session attendees...");
        }

        let mut rng = rand::thread_rng();
        let session_ids = &self.relationship_map.live_session_ids;
        let student_ids = self
            .relationship_map
            .user_ids
            .get(&UserTypeEnums::STUDENT)
            .cloned()
            .unwrap_or_default();

        if session_ids.is_empty() || student_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No sessions or students found, skipping attendees");
            }
            return Ok(());
        }

        for session_id in session_ids {
            let attendee_count = rng.gen_range(0..=student_ids.len().min(15));

            for &student_id in student_ids.iter().take(attendee_count) {
                let joined_at = chrono::Utc::now()
                    .checked_add_signed(chrono::Duration::hours(rng.gen_range(-72..0)))
                    .unwrap();
                let left_at = if rng.gen_bool(0.7) {
                    Some(
                        joined_at
                            .checked_add_signed(chrono::Duration::minutes(rng.gen_range(5..60)))
                            .unwrap(),
                    )
                } else {
                    None
                };

                let model = live_session_attendee::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    session_id: Set(*session_id),
                    user_id: Set(student_id),
                    joined_at: Set(joined_at.into()),
                    left_at: Set(left_at.map(|dt| dt.into())),
                };
                model.insert(txn).await?;
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded live session attendees");
        }

        Ok(())
    }
}

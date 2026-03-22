use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::live_session;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_live_sessions(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🎥 Seeding live sessions...");
        }

        let providers = ["zoom", "google_meet", "microsoft_teams", "custom"];

        let topic_ids = self
            .relationship_map
            .topic_map
            .values()
            .flatten()
            .copied()
            .collect::<Vec<_>>();

        let mut rng = rand::thread_rng();
        let mut all_session_ids = Vec::new();

        for (idx, topic_id) in topic_ids.iter().enumerate().take(20) {
            let scheduled_at = chrono::Utc::now()
                .checked_add_signed(chrono::Duration::days((idx as i64) % 14))
                .unwrap()
                .checked_add_signed(chrono::Duration::hours((idx as i64) % 24))
                .unwrap();

            let session_id = Uuid::new_v4();
            let session_model = live_session::ActiveModel {
                id: Set(session_id),
                topic_id: Set(*topic_id),
                scheduled_at: Set(scheduled_at.into()),
                duration_min: Set(30 + (rng.gen_range(0..5) * 15)),
                provider: Set(providers[idx % providers.len()].to_string()),
                join_url: Set(format!(
                    "https://meet.example.com/session/{}",
                    Uuid::new_v4()
                )),
            };

            session_model.insert(txn).await?;
            all_session_ids.push(session_id);
        }

        self.relationship_map.live_session_ids = all_session_ids;

        if self.config.show_progress {
            println!("✅ Seeded live sessions");
        }

        Ok(())
    }
}

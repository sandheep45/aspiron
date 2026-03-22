use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::live_session_recording;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_live_session_recordings(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🎬 Seeding live session recordings...");
        }

        let session_ids = &self.relationship_map.live_session_ids;

        if session_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No live sessions found, skipping recordings");
            }
            return Ok(());
        }

        for session_id in session_ids.iter().take(10) {
            let recording_model = live_session_recording::ActiveModel {
                id: Set(Uuid::new_v4()),
                session_id: Set(*session_id),
                recording_url: Set(format!(
                    "https://recordings.example.com/session_{}.mp4",
                    session_id
                )),
                created_at: Set(chrono::Utc::now().into()),
            };

            recording_model.insert(txn).await?;
        }

        if self.config.show_progress {
            println!("✅ Seeded live session recordings");
        }

        Ok(())
    }
}

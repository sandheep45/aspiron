use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::user_session;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_user_sessions(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🔐 Seeding user sessions...");
        }

        let mut rng = rand::thread_rng();

        let user_ids: Vec<Uuid> = self
            .relationship_map
            .user_ids
            .values()
            .flatten()
            .copied()
            .collect();

        for (idx, user_id) in user_ids.iter().enumerate().take(30) {
            let session_token = format!("session_token_{}_{}", user_id, idx);
            let token_hash = format!("{:x}", simple_hash(&session_token));
            let created_at = chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::hours(rng.gen_range(1..168)))
                .unwrap();
            let last_activity = chrono::Utc::now()
                .checked_sub_signed(chrono::Duration::minutes(rng.gen_range(1..60)))
                .unwrap();
            let expires_at = chrono::Utc::now()
                .checked_add_signed(chrono::Duration::days(7))
                .unwrap();

            let session_model = user_session::ActiveModel {
                id: Set(Uuid::new_v4()),
                user_id: Set(*user_id),
                session_token_hash: Set(token_hash),
                ip_address: Set(Some(format!("192.168.1.{}", rng.gen_range(1..255)))),
                user_agent: Set(Some(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)".to_string(),
                )),
                created_at: Set(created_at.into()),
                last_activity: Set(last_activity.into()),
                expires_at: Set(expires_at.into()),
                is_active: Set(rng.gen_bool(0.8)),
            };

            session_model.insert(txn).await?;
        }

        if self.config.show_progress {
            println!("✅ Seeded user sessions");
        }

        Ok(())
    }
}

fn simple_hash(input: &str) -> u64 {
    let mut hash: u64 = 0;
    for (i, byte) in input.bytes().enumerate() {
        hash = hash.wrapping_add((byte as u64).wrapping_mul(31_u64.wrapping_pow(i as u32)));
    }
    hash
}

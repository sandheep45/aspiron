use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::assessment_proctoring_signal;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_assessment_proctoring(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📹 Seeding assessment proctoring signals...");
        }

        let signal_types = [
            "tab_switch",
            "focus_lost",
            "right_click",
            "copy_attempt",
            "screenshot",
            "window_resize",
        ];

        let signal_values = ["low", "medium", "high", "critical"];

        let attempt_ids = &self.relationship_map.attempt_ids;

        if attempt_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No assessment attempts found, skipping proctoring signals");
            }
            return Ok(());
        }

        let mut rng = rand::thread_rng();
        let mut signals_count = 0;

        for (idx, attempt_id) in attempt_ids.iter().enumerate() {
            let num_signals = rng.gen_range(0..10);

            for j in 0..num_signals {
                signals_count += 1;
                let signal_model = assessment_proctoring_signal::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    attempt_id: Set(*attempt_id),
                    signal_type: Set(signal_types[(idx + j) % signal_types.len()].to_string()),
                    signal_value: Set(
                        signal_values[rng.gen_range(0..signal_values.len())].to_string()
                    ),
                    created_at: Set(chrono::Utc::now().into()),
                };

                signal_model.insert(txn).await?;
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded {} assessment proctoring signals", signals_count);
        }

        Ok(())
    }
}

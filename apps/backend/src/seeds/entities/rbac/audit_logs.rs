use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::audit_log;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_audit_logs(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📋 Seeding audit logs...");
        }

        let actions = vec![
            ("LOGIN", Some("USER"), None),
            ("LOGOUT", Some("USER"), None),
            ("CREATE", Some("CONTENT"), None),
            ("UPDATE", Some("CONTENT"), None),
            ("DELETE", Some("CONTENT"), None),
            ("CREATE", Some("ASSESSMENT"), None),
            ("TAKE", Some("ASSESSMENT"), None),
            ("GRADE", Some("ASSESSMENT"), None),
            ("CREATE", Some("THREAD"), None),
            ("CREATE", Some("POST"), None),
        ];

        let user_ids = self
            .relationship_map
            .user_ids
            .values()
            .flatten()
            .collect::<Vec<_>>();

        for i in 0..100 {
            if let Some(user_id) = user_ids.get(i % user_ids.len()) {
                let action_data = &actions[i % actions.len()];
                let timestamp = chrono::Utc::now()
                    .checked_sub_signed(chrono::Duration::hours(i as i64))
                    .unwrap();
                let user_uuid = **user_id;

                let audit_model = audit_log::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    user_id: Set(Some(user_uuid)),
                    action: Set(action_data.0.to_string()),
                    resource_type: Set(action_data.1.map(String::from)),
                    resource_id: Set(action_data.2),
                    old_values: Set(None),
                    new_values: Set(None),
                    ip_address: Set(Some(format!("192.168.1.{}", i % 255))),
                    user_agent: Set(Some(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)".to_string(),
                    )),
                    timestamp: Set(timestamp.into()),
                    success: Set(i % 10 != 9),
                    failure_reason: Set(if i % 10 == 9 {
                        Some("Access denied".to_string())
                    } else {
                        None
                    }),
                    session_id: Set(Some(format!("session_{}", i))),
                };

                audit_model.insert(txn).await?;
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded audit logs");
        }

        Ok(())
    }
}

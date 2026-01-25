use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::content_chapter;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_chapters(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📖 Seeding chapters...");
        }

        let mut chapter_map = std::collections::HashMap::new();

        // For each subject, create 5 chapters
        for subject_ids in self.relationship_map.subject_ids.values() {
            for subject_id in subject_ids {
                let mut chapter_ids = Vec::new();

                for chapter_num in 1..=5 {
                    let chapter_id = Uuid::new_v4();
                    let chapter_name = format!("Chapter {}", chapter_num);

                    let chapter_model = content_chapter::ActiveModel {
                        id: Set(chapter_id),
                        name: Set(chapter_name),
                        subject_id: Set(*subject_id),
                        order_number: Set(chapter_num),
                    };

                    chapter_model.insert(txn).await?;
                    chapter_ids.push(chapter_id);
                }

                chapter_map.insert(*subject_id, chapter_ids);
            }
        }

        self.relationship_map.chapter_map = chapter_map;

        if self.config.show_progress {
            println!("✅ Seeded 75 chapters (5 per subject)");
        }

        Ok(())
    }
}

use anyhow::Result;
use sea_orm::DatabaseTransaction;

use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn validate_relationships(&self, _txn: &DatabaseTransaction) -> Result<()> {
        // Basic validation checks
        if self.relationship_map.user_ids.is_empty() {
            return Err(anyhow::anyhow!("No users found"));
        }

        if self.relationship_map.subject_ids.is_empty() {
            return Err(anyhow::anyhow!("No subjects found"));
        }

        // Validate relationship counts are reasonable
        let total_users: usize = self
            .relationship_map
            .user_ids
            .values()
            .map(|v| v.len())
            .sum();
        let total_subjects: usize = self
            .relationship_map
            .subject_ids
            .values()
            .map(|v| v.len())
            .sum();
        let total_chapters: usize = self
            .relationship_map
            .chapter_map
            .values()
            .map(|v| v.len())
            .sum();
        let total_topics: usize = self
            .relationship_map
            .topic_map
            .values()
            .map(|v| v.len())
            .sum();

        if total_users != 43 {
            return Err(anyhow::anyhow!("Expected 43 users, found {}", total_users));
        }

        if total_subjects != 15 {
            return Err(anyhow::anyhow!(
                "Expected 15 subjects, found {}",
                total_subjects
            ));
        }

        if total_chapters != 75 {
            return Err(anyhow::anyhow!(
                "Expected 75 chapters, found {}",
                total_chapters
            ));
        }

        if total_topics != 750 {
            return Err(anyhow::anyhow!(
                "Expected 750 topics, found {}",
                total_topics
            ));
        }

        Ok(())
    }
}

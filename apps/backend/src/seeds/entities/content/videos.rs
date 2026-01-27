use anyhow::Result;
use rand::{Rng, thread_rng};
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::content_video;
use crate::seeds::runner::SeedRunner;
use crate::seeds::utils::generators::{generate_mock_video_url, generate_random_duration_seconds};

impl<'a> SeedRunner<'a> {
    pub async fn seed_videos(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🎥 Seeding videos...");
        }

        let mut video_map = std::collections::HashMap::new();

        // For each topic, create 4-8 videos
        for topic_ids in self.relationship_map.topic_map.values() {
            for topic_id in topic_ids {
                let num_videos = 4 + (thread_rng().gen_range(0..5)); // 4-8 videos
                let mut video_ids = Vec::new();

                for video_num in 1..=num_videos {
                    let video_id = Uuid::new_v4();
                    let video_title = format!(
                        "Video {}: {} Lecture",
                        video_num,
                        [
                            "Introduction",
                            "Concept Explanation",
                            "Problem Solving",
                            "Advanced Topics"
                        ][thread_rng().gen_range(0..4)]
                    );

                    let video_model = content_video::ActiveModel {
                        id: Set(video_id),
                        topic_id: Set(*topic_id),
                        title: Set(video_title),
                        duration_seconds: Set(generate_random_duration_seconds()),
                        video_url: Set(generate_mock_video_url(video_id)),
                        transcript: Set(Some(
                            "This is a sample transcript for the video.".to_string(),
                        )),
                    };

                    video_model.insert(txn).await?;
                    video_ids.push(video_id);
                }

                video_map.insert(*topic_id, video_ids);
            }
        }

        self.relationship_map.video_map = video_map;

        let total_videos: usize = self
            .relationship_map
            .video_map
            .values()
            .map(|v| v.len())
            .sum();
        if self.config.show_progress {
            println!("✅ Seeded {} videos (4-8 per topic)", total_videos);
        }

        Ok(())
    }
}

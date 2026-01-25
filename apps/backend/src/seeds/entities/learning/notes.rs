use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::learning_notes;
use crate::entries::entitiy_enums::content_owner_types::ContentOwnerTypeEnum;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_learning_notes(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📝 Seeding learning notes...");
        }

        // Create some sample learning notes for students
        if let Some(student_ids) = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entitiy_enums::user_types::UserTypeEnums::STUDENT)
        {
            let topics = self.relationship_map.get_topics_for_subject(
                *self
                    .relationship_map
                    .subject_ids
                    .get(&crate::entries::entitiy_enums::exam_types::ExamTypeEnums::JEE)
                    .unwrap_or(&vec![])
                    .first()
                    .unwrap(),
            );

            // Create notes for 3 students across 5 topics
            for (student_idx, student_id) in student_ids.iter().take(3).enumerate() {
                for topic_id in topics.iter().take(5) {
                    let topic_id = *topic_id;
                    let video_ids = self.relationship_map.get_videos_for_topic(topic_id);

                    if let Some(video_id) = video_ids.first() {
                        let note_model = learning_notes::ActiveModel {
        id: Set(Uuid::new_v4()),
        topic_id: Set(topic_id),
        owner_type: Set(ContentOwnerTypeEnum::STUDENT),
        owner_id: Set(Some(*student_id)),        // Wrap the Option in Set
        video_id: Set(Some(*video_id)),          // Wrap the Option in Set
        video_timestamp: Set(Some(300)),         // 5 minutes into video
        content_type: Set(crate::entries::entitiy_enums::notes_content_type::NotesContentTypeEnum::INLINE),
        content: Set(Some(format!("Student {} note: This concept is clear now.", student_idx + 1))),
        is_public: Set(student_idx % 2 == 0),    // 50% public
        trust_level: Set(crate::entries::entitiy_enums::trust_level::TrustLevelEnum::USER),
        created_at: Set(chrono::Utc::now().into()),
        updated_at: Set(chrono::Utc::now().into()),
        deleted_at: Set(None),                    // Wrap None in Set
        external_url: Set(None),                  // Wrap None in Set
        external_type: Set(None),                 // Wrap None in Set
    };

                        note_model.insert(txn).await?;
                    }
                }
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded learning notes");
        }

        Ok(())
    }
}

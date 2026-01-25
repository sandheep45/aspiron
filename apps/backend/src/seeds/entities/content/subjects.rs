use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::content_subject;
use crate::entries::entitiy_enums::exam_types::ExamTypeEnums;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_subjects(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("📚 Seeding subjects...");
        }

        // JEE Subjects (5 subjects)
        let jee_subjects = vec![
            "Physics",
            "Chemistry",
            "Mathematics",
            "Aptitude",
            "Advanced Problems",
        ];

        // NEET Subjects (5 subjects)
        let neet_subjects = vec![
            "Physics",
            "Chemistry",
            "Biology (Botany)",
            "Biology (Zoology)",
            "General Knowledge",
        ];

        // STATE_PGT Subjects (5 subjects)
        let state_pgt_subjects = vec![
            "General Studies",
            "Reasoning",
            "Quantitative Aptitude",
            "English Language",
            "Computer Awareness",
        ];

        let mut jee_ids = Vec::new();
        let mut neet_ids = Vec::new();
        let mut state_pgt_ids = Vec::new();

        // Seed JEE subjects
        for subject_name in jee_subjects {
            let subject_id = Uuid::new_v4();
            let subject_model = content_subject::ActiveModel {
                id: Set(subject_id),
                name: Set(subject_name.to_string()),
                exam_type: Set(ExamTypeEnums::JEE),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            };

            subject_model.insert(txn).await?;
            jee_ids.push(subject_id);
        }

        // Seed NEET subjects
        for subject_name in neet_subjects {
            let subject_id = Uuid::new_v4();
            let subject_model = content_subject::ActiveModel {
                id: Set(subject_id),
                name: Set(subject_name.to_string()),
                exam_type: Set(ExamTypeEnums::NEET),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            };

            subject_model.insert(txn).await?;
            neet_ids.push(subject_id);
        }

        // Seed STATE_PGT subjects
        for subject_name in state_pgt_subjects {
            let subject_id = Uuid::new_v4();
            let subject_model = content_subject::ActiveModel {
                id: Set(subject_id),
                name: Set(subject_name.to_string()),
                exam_type: Set(ExamTypeEnums::StatePGT),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            };

            subject_model.insert(txn).await?;
            state_pgt_ids.push(subject_id);
        }

        // Store in relationship map
        self.relationship_map
            .subject_ids
            .insert(ExamTypeEnums::JEE, jee_ids);
        self.relationship_map
            .subject_ids
            .insert(ExamTypeEnums::NEET, neet_ids);
        self.relationship_map
            .subject_ids
            .insert(ExamTypeEnums::StatePGT, state_pgt_ids);

        if self.config.show_progress {
            println!("✅ Seeded 15 subjects (5 per exam type)");
        }

        Ok(())
    }
}

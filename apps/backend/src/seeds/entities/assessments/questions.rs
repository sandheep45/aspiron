use anyhow::Result;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use serde_json::json;
use uuid::Uuid;

use crate::entries::entities::assessment_question;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_questions(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("❓ Seeding questions...");
        }

        let mut question_map = std::collections::HashMap::new();

        // For each quiz, create 10 questions
        for quiz_ids in self.relationship_map.quiz_map.values() {
            for quiz_id in quiz_ids {
                let mut question_ids = Vec::new();

                for question_num in 1..=10 {
                    let question_id = Uuid::new_v4();
                    let question_text = format!(
                        "Question {}: What is the correct answer to this problem?",
                        question_num
                    );
                    let options = json!(["Option A", "Option B", "Option C", "Option D"]);
                    let correct_answer = format!(
                        "Option {}",
                        ['A', 'B', 'C', 'D'][rand::random::<usize>() % 4]
                    );

                    let question_model = assessment_question::ActiveModel {
                        id: Set(question_id),
                        question: Set(question_text),
                        options: Set(options),
                        correct_answer: Set(correct_answer),
                        quiz_id: Set(*quiz_id),
                    };

                    question_model.insert(txn).await?;
                    question_ids.push(question_id);
                }

                question_map.insert(*quiz_id, question_ids);
            }
        }

        self.relationship_map.question_map = question_map;

        if self.config.show_progress {
            println!("✅ Seeded questions");
        }

        Ok(())
    }
}

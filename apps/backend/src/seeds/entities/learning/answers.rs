use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::learning_recall_answer;
use crate::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_learning_recall_answers(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("💡 Seeding learning recall answers...");
        }

        let mcq_questions = [
            ("What is the derivative of sin(x)?", "cos(x)"),
            ("What is the formula for area of a circle?", "πr²"),
            (
                "What is Newton's first law about?",
                "Inertia - objects at rest stay at rest",
            ),
        ];

        let reflection_questions = [
            (
                "Explain photosynthesis in your own words.",
                "Process where plants convert sunlight into energy.",
            ),
            (
                "What did you learn about quadratic equations?",
                "They form a parabola when graphed.",
            ),
        ];

        let session_ids = &self.relationship_map.session_ids;

        if session_ids.is_empty() {
            if self.config.show_progress {
                println!("⚠️ No recall sessions found, skipping answers");
            }
            return Ok(());
        }

        let mut rng = rand::thread_rng();
        let mut answers_count = 0;

        for session_id in session_ids.iter() {
            let num_answers = rng.gen_range(2..6);

            for j in 0..num_answers {
                answers_count += 1;
                let is_mcq = rng.gen_bool(0.6);
                let (question, answer) = if is_mcq {
                    let qa = &mcq_questions[j % mcq_questions.len()];
                    (qa.0.to_string(), qa.1.to_string())
                } else {
                    let qa = &reflection_questions[j % reflection_questions.len()];
                    (qa.0.to_string(), qa.1.to_string())
                };

                let answer_model = learning_recall_answer::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    session_id: Set(*session_id),
                    question_type: Set(if is_mcq {
                        LearningRecallQuestionTypeEnum::MCQ
                    } else {
                        LearningRecallQuestionTypeEnum::REFLECTION
                    }),
                    question: Set(question),
                    answer: Set(answer),
                    is_correct: Set(rng.gen_bool(0.75)),
                };

                answer_model.insert(txn).await?;
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded {} learning recall answers", answers_count);
        }

        Ok(())
    }
}

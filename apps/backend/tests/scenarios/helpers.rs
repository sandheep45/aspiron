use sea_orm::{ActiveModelTrait, DatabaseConnection, Set};
use uuid::Uuid;

use backend::entries::entities::{assessment_question, assessment_quiz, learning_recall_session};
use backend::entries::entity_enums::learning_recall_session_status::LearningRecallSessionStatusEnum;

use crate::fixtures::context::TestRecallSession;

pub struct TestQuiz {
    pub id: Uuid,
}

pub async fn create_test_quiz(db: &DatabaseConnection, topic_id: Uuid, title: &str) -> TestQuiz {
    let id = Uuid::new_v4();

    let model = assessment_quiz::ActiveModel {
        id: Set(id),
        topic_id: Set(topic_id),
        title: Set(title.to_string()),
    };
    model.insert(db).await.expect("insert quiz");

    TestQuiz { id }
}

pub async fn create_test_questions(db: &DatabaseConnection, quiz_id: Uuid, count: usize) {
    for i in 0..count {
        let id = Uuid::new_v4();

        let model = assessment_question::ActiveModel {
            id: Set(id),
            question: Set(format!("Test question {}", i + 1)),
            correct_answer: Set("A".to_string()),
            options: Set(serde_json::json!({
                "A": "Option A",
                "B": "Option B",
                "C": "Option C",
                "D": "Option D",
            })),
            quiz_id: Set(quiz_id),
        };
        model.insert(db).await.expect("insert question");
    }
}

pub async fn create_test_recall_session(
    db: &DatabaseConnection,
    user_id: Uuid,
    topic_id: Uuid,
) -> TestRecallSession {
    let id = Uuid::new_v4();
    let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();

    let model = learning_recall_session::ActiveModel {
        id: Set(id),
        user_id: Set(user_id),
        topic_id: Set(topic_id),
        status: Set(LearningRecallSessionStatusEnum::PENDING),
        started_at: Set(now),
        completed_at: Set(None),
    };
    model.insert(db).await.expect("insert recall session");

    TestRecallSession { id }
}

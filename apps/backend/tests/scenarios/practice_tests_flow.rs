use axum::body::to_bytes;
use axum::http::StatusCode;
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::create_test_assessment_attempt;
use crate::harness::TestApp;
use crate::scenarios::helpers::{create_test_questions, create_test_quiz};
use crate::scenarios::scenario_builder::ScenarioBuilder;

static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn unique_email(prefix: &str) -> String {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{prefix}{n}@test.com")
}

#[tokio::test]
async fn scenario_create_question_lifecycle() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user(&unique_email("cq_admin"), "pass", UserTypeEnums::ADMIN)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .build()
        .await;

    let topic = ctx.topic.as_ref().expect("topic");

    // POST a practice question
    let response = app
        .post_json(
            &format!("/api/v1/topics/{}/practice/questions", topic.id),
            serde_json::json!({
                "question": "What is Newton's second law?",
                "question_type": "MCQ",
                "difficulty": "Medium",
                "correct_answer": "F = ma",
                "choices": ["F = ma", "F = mv", "F = md", "a = F/m"],
                "explanation": "Newton's second law states F = ma",
            }),
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(json["identifier"].as_str().unwrap().starts_with("Q-"));

    // GET overview → total_questions = 1
    let overview = app
        .get(&format!("/api/v1/topics/{}/practice/overview", topic.id))
        .await;
    assert_eq!(overview.status(), StatusCode::OK);
    let body = to_bytes(overview.into_body(), usize::MAX)
        .await
        .expect("read body");
    let overview_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(overview_json["total_questions"], 1);

    // GET questions → items has 1 entry
    let questions = app
        .get(&format!("/api/v1/topics/{}/practice/questions", topic.id))
        .await;
    assert_eq!(questions.status(), StatusCode::OK);
    let body = to_bytes(questions.into_body(), usize::MAX)
        .await
        .expect("read body");
    let q_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(q_json["total"], 1);
    assert_eq!(q_json["items"].as_array().unwrap().len(), 1);
}

#[tokio::test]
async fn scenario_create_test_with_selected_questions() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user(&unique_email("ct_admin"), "pass", UserTypeEnums::ADMIN)
        .subject("Math", ExamTypeEnums::JEE)
        .chapter("Algebra")
        .topic("Quadratic Equations")
        .build()
        .await;

    let topic = ctx.topic.as_ref().expect("topic");

    // Create a practice quiz with 5 questions
    let quiz = create_test_quiz(db, topic.id, "Practice Questions").await;
    create_test_questions(db, quiz.id, 5).await;

    // Get question IDs via HTTP
    let questions = app
        .get(&format!("/api/v1/topics/{}/practice/questions", topic.id))
        .await;
    assert_eq!(questions.status(), StatusCode::OK);
    let body = to_bytes(questions.into_body(), usize::MAX)
        .await
        .expect("read body");
    let q_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let question_ids: Vec<String> = q_json["items"]
        .as_array()
        .unwrap()
        .iter()
        .map(|item| item["id"].as_str().unwrap().to_string())
        .collect();
    assert_eq!(question_ids.len(), 5);

    // POST test with 3 of the question_ids
    let test_response = app
        .post_json(
            &format!("/api/v1/topics/{}/practice/tests", topic.id),
            serde_json::json!({
                "title": "Quadratic Equations Assessment",
                "duration_minutes": 30,
                "passing_score": 40,
                "question_ids": [question_ids[0], question_ids[1], question_ids[2]],
            }),
        )
        .await;
    assert_eq!(test_response.status(), StatusCode::OK);
    let body = to_bytes(test_response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let test_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(test_json["title"], "Quadratic Equations Assessment");
    assert_eq!(test_json["questions_count"], 3);

    // GET tests → array with 1 entry (the new test + the practice questions quiz)
    let tests = app
        .get(&format!("/api/v1/topics/{}/practice/tests", topic.id))
        .await;
    assert_eq!(tests.status(), StatusCode::OK);
    let body = to_bytes(tests.into_body(), usize::MAX)
        .await
        .expect("read body");
    let tests_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(
        tests_json.as_array().unwrap().len() >= 2,
        "should have at least 2 quizzes (practice + test)"
    );
}

#[tokio::test]
async fn scenario_full_practice_workflow() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user(&unique_email("fp_admin"), "pass", UserTypeEnums::ADMIN)
        .with_user(&unique_email("fp_student"), "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Optics")
        .topic("Lenses")
        .build()
        .await;

    let topic = ctx.topic.as_ref().expect("topic");
    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");

    // Create practice quiz + 3 questions via fixtures
    let quiz = create_test_quiz(db, topic.id, "Practice Questions").await;
    create_test_questions(db, quiz.id, 3).await;
    create_test_assessment_attempt(db, quiz.id, student.id, 85).await;

    // GET overview → total_questions = 3, total_tests = 1
    let overview = app
        .get(&format!("/api/v1/topics/{}/practice/overview", topic.id))
        .await;
    assert_eq!(overview.status(), StatusCode::OK);
    let body = to_bytes(overview.into_body(), usize::MAX)
        .await
        .expect("read body");
    let ov: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(ov["total_questions"], 3);
    assert_eq!(ov["total_tests"], 1);

    // GET signals → non-empty
    let signals = app
        .get(&format!("/api/v1/topics/{}/practice/signals", topic.id))
        .await;
    assert_eq!(signals.status(), StatusCode::OK);
    let body = to_bytes(signals.into_body(), usize::MAX)
        .await
        .expect("read body");
    let sig: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(!sig.as_array().unwrap().is_empty());

    // GET analytics → non-null with attempt data
    let analytics = app
        .get(&format!("/api/v1/topics/{}/practice/analytics", topic.id))
        .await;
    assert_eq!(analytics.status(), StatusCode::OK);
    let body = to_bytes(analytics.into_body(), usize::MAX)
        .await
        .expect("read body");
    let an: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(!an.is_null(), "analytics should not be null with seed data");
    assert!(!an["average_score_trend"].as_array().unwrap().is_empty());
    assert!(!an["difficulty_distribution"].as_array().unwrap().is_empty());
}

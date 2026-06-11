use axum::body::to_bytes;
use axum::http::StatusCode;
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_completed_recall_session, create_test_recall_answer_variant,
};
use crate::harness::TestApp;
use crate::scenarios::scenario_builder::ScenarioBuilder;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;

static COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

fn unique_email(prefix: &str) -> String {
    let n = COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    format!("{prefix}{n}@test.com")
}

#[tokio::test]
async fn scenario_full_recall_insights_workflow() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user(&unique_email("ri_admin"), "pass", UserTypeEnums::ADMIN)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Electrostatics")
        .topic("Gauss's Law")
        .build()
        .await;

    let topic = ctx.topic.as_ref().expect("topic");
    let admin = ctx.users.get(&UserTypeEnums::ADMIN).expect("admin");

    // Create 3 recall sessions with mixed MCQ + reflection answers
    for _ in 0..3 {
        let session = create_test_completed_recall_session(db, admin.id, topic.id).await;
        // 4 MCQ answers per session (2 correct, 2 incorrect)
        for j in 0..4 {
            create_test_recall_answer_variant(
                db,
                session.id,
                LearningRecallQuestionTypeEnum::MCQ,
                j % 2 == 0,
                Some(if j % 2 == 0 { 85 } else { 30 }),
            )
            .await;
        }
        // 3 reflection answers per session (2 correct, 1 incorrect)
        for j in 0..3 {
            create_test_recall_answer_variant(
                db,
                session.id,
                LearningRecallQuestionTypeEnum::REFLECTION,
                j != 1,
                None,
            )
            .await;
        }
    }

    // GET overview
    let overview = app
        .get(&format!("/api/v1/topics/{}/recall/overview", topic.id))
        .await;
    assert_eq!(overview.status(), StatusCode::OK);
    let body = to_bytes(overview.into_body(), usize::MAX)
        .await
        .expect("read body");
    let ov: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(
        ov["avg_recall_score"].as_f64().unwrap() > 0.0,
        "avg_recall_score should be > 0"
    );
    assert!(
        ov["completion_rate"].as_f64().unwrap() > 0.0,
        "completion_rate should be > 0"
    );

    // GET mcq
    let mcq = app
        .get(&format!("/api/v1/topics/{}/recall/mcq", topic.id))
        .await;
    assert_eq!(mcq.status(), StatusCode::OK);
    let body = to_bytes(mcq.into_body(), usize::MAX)
        .await
        .expect("read body");
    let mcq_json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(
        mcq_json["overall_accuracy"].as_f64().unwrap() > 0.0,
        "overall_accuracy > 0"
    );
    assert_eq!(mcq_json["total_questions_attempted"], 12);

    // GET free-response
    let free = app
        .get(&format!("/api/v1/topics/{}/recall/free-response", topic.id))
        .await;
    assert_eq!(free.status(), StatusCode::OK);
    let body = to_bytes(free.into_body(), usize::MAX)
        .await
        .expect("read body");
    let fr: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(
        fr["ai_clarity_score"].as_f64().unwrap() >= 0.0,
        "ai_clarity_score >= 0"
    );
    assert!(
        !fr["missing_concepts"].as_array().unwrap().is_empty(),
        "should have missing concepts"
    );

    // GET gaps
    let gaps = app
        .get(&format!("/api/v1/topics/{}/recall/gaps", topic.id))
        .await;
    assert_eq!(gaps.status(), StatusCode::OK);
    let body = to_bytes(gaps.into_body(), usize::MAX)
        .await
        .expect("read body");
    let gp: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(
        !gp["items"].as_array().unwrap().is_empty(),
        "should have gap items"
    );

    // GET actions
    let actions = app
        .get(&format!("/api/v1/topics/{}/recall/actions", topic.id))
        .await;
    assert_eq!(actions.status(), StatusCode::OK);
    let body = to_bytes(actions.into_body(), usize::MAX)
        .await
        .expect("read body");
    let ac: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(ac.as_array().unwrap().len(), 4);

    // GET trends (≥ 2 sessions → non-null)
    let trends = app
        .get(&format!("/api/v1/topics/{}/recall/trends", topic.id))
        .await;
    assert_eq!(trends.status(), StatusCode::OK);
    let body = to_bytes(trends.into_body(), usize::MAX)
        .await
        .expect("read body");
    let tr: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(!tr.is_null(), "trends should not be null with 3 sessions");
    assert!(
        !tr["recall_trend"].as_array().unwrap().is_empty(),
        "recall_trend should have data"
    );
    assert!(
        !tr["memory_decay_curve"].as_array().unwrap().is_empty(),
        "memory_decay_curve should have data"
    );
}

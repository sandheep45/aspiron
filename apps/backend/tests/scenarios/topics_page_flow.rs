use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::ActiveModelTrait;
use uuid::Uuid;

use backend::entries::entities::content_video;
use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_assessment_attempt, create_test_chapter, create_test_completed_recall_session,
    create_test_quiz, create_test_recall_answer_variant, create_test_topic,
};
use crate::harness::TestApp;
use crate::scenarios::scenario_builder::ScenarioBuilder;

async fn get_json(app: &TestApp, path: &str) -> serde_json::Value {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

#[tokio::test]
async fn topics_page_flow_full_view() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@test.com", "pass", UserTypeEnums::ADMIN)
        .with_user("student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .build()
        .await;

    let subject_id = ctx.subject.as_ref().expect("subject").id;
    let chapter = create_test_chapter(db, subject_id, "Electrostatics", 1).await;
    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");

    // Topic 1: healthy — has video, quiz, good recall + accuracy
    let t1 = create_test_topic(db, chapter.id, "Coulomb's Law", 1).await;
    content_video::ActiveModel {
        id: sea_orm::Set(Uuid::new_v4()),
        topic_id: sea_orm::Set(t1.id),
        transcript: sea_orm::Set(None),
        title: sea_orm::Set("Coulomb Video".to_string()),
        duration_seconds: sea_orm::Set(600),
        video_url: sea_orm::Set("https://example.com/video".to_string()),
    }
    .insert(db)
    .await
    .expect("insert video");
    let q1 = create_test_quiz(db, t1.id, "Coulomb Quiz").await;
    let s1 = create_test_completed_recall_session(db, student.id, t1.id).await;
    for _ in 0..10 {
        create_test_recall_answer_variant(
            db,
            s1.id,
            LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(1),
        )
        .await;
    }
    create_test_assessment_attempt(db, q1, student.id, 90).await;

    // Topic 2: needs attention — has video + quiz, weak recall
    let t2 = create_test_topic(db, chapter.id, "Electric Field", 2).await;
    content_video::ActiveModel {
        id: sea_orm::Set(Uuid::new_v4()),
        topic_id: sea_orm::Set(t2.id),
        transcript: sea_orm::Set(None),
        title: sea_orm::Set("Electric Field Video".to_string()),
        duration_seconds: sea_orm::Set(600),
        video_url: sea_orm::Set("https://example.com/video".to_string()),
    }
    .insert(db)
    .await
    .expect("insert video");
    let q2 = create_test_quiz(db, t2.id, "Electric Field Quiz").await;
    let s2 = create_test_completed_recall_session(db, student.id, t2.id).await;
    for _ in 0..10 {
        create_test_recall_answer_variant(
            db,
            s2.id,
            LearningRecallQuestionTypeEnum::MCQ,
            false,
            Some(0),
        )
        .await;
    }
    create_test_assessment_attempt(db, q2, student.id, 50).await;

    // Topic 3: draft — has quiz only, no video
    let _t3 = create_test_topic(db, chapter.id, "Gauss Law", 3).await;
    create_test_quiz(db, _t3.id, "Gauss Quiz").await;

    // Verify summary
    let summary = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/summary", chapter.id),
    )
    .await;
    assert_eq!(summary["chapter_name"], "Electrostatics");
    assert_eq!(summary["total_topics"], 3);
    assert_eq!(summary["weak_topics"], 1);
    // published_topics = topics with quizzes (all 3 have quizzes)
    // draft_topics = total - published

    // Verify topics list with search
    let topics = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?search=gauss&sort_by=name&sort_order=asc",
            chapter.id
        ),
    )
    .await;
    let items = topics.as_array().unwrap();
    assert_eq!(items.len(), 1);
    assert_eq!(items[0]["name"], "Gauss Law");

    // Verify topics list with sort by accuracy desc
    let topics_asc = get_json(
        &app,
        &format!(
            "/api/v1/chapters/{}/topics-page/topics?sort_by=accuracy&sort_order=desc",
            chapter.id
        ),
    )
    .await;
    let items_asc = topics_asc.as_array().unwrap();
    // All 3 topics have quizzes, so all are returned with accuracy data
    assert_eq!(items_asc.len(), 3);
    let acc0 = items_asc[0]["practice_accuracy"].as_f64().unwrap();
    let acc1 = items_asc[1]["practice_accuracy"].as_f64().unwrap();
    assert!(acc0 >= acc1, "sort desc expected {} >= {}", acc0, acc1);

    // Verify insights
    let insights = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/insights", chapter.id),
    )
    .await;
    let insight_items = insights.as_array().unwrap();
    assert!(!insight_items.is_empty());
}

#[tokio::test]
async fn topics_page_flow_no_content() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("admin@test.com", "pass", UserTypeEnums::ADMIN)
        .subject("Physics", ExamTypeEnums::JEE)
        .build()
        .await;

    let subject_id = ctx.subject.as_ref().expect("subject").id;
    let chapter = create_test_chapter(db, subject_id, "Empty Chapter", 1).await;

    let summary = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/summary", chapter.id),
    )
    .await;
    assert_eq!(summary["total_topics"], 0);

    let topics = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/topics", chapter.id),
    )
    .await;
    assert!(topics.as_array().unwrap().is_empty());

    let insights = get_json(
        &app,
        &format!("/api/v1/chapters/{}/topics-page/insights", chapter.id),
    )
    .await;
    assert!(!insights.as_array().unwrap().is_empty());
}

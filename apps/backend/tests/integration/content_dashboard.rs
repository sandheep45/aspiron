use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::DatabaseConnection;
use uuid::Uuid;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::helpers::{
    create_test_chapter, create_test_completed_recall_session, create_test_quiz,
    create_test_recall_answer_variant, create_test_subject, create_test_topic, create_test_user,
};
use crate::harness::TestApp;

async fn create_content_hierarchy(
    db: &DatabaseConnection,
    subject_name: &str,
    chapter_name: &str,
    topic_name: &str,
) -> Uuid {
    let subject = create_test_subject(db, subject_name, ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(db, subject.id, chapter_name, 1).await;
    let topic = create_test_topic(db, chapter.id, topic_name, 1).await;
    topic.id
}

static STUDENT_COUNTER: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

async fn seed_topic_accuracy(
    db: &DatabaseConnection,
    topic_id: Uuid,
    correct: usize,
    total: usize,
) {
    let n = STUDENT_COUNTER.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let user = create_test_user(
        db,
        &format!("student{n}@test.com"),
        "pass",
        UserTypeEnums::STUDENT,
    )
    .await;
    let session = create_test_completed_recall_session(db, user.id, topic_id).await;
    for i in 0..total {
        create_test_recall_answer_variant(
            db,
            session.id,
            LearningRecallQuestionTypeEnum::MCQ,
            i < correct,
            Some(if i < correct { 1 } else { 0 }),
        )
        .await;
    }
}

async fn get_json(app: &TestApp, path: &str) -> serde_json::Value {
    let response = app.get(path).await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    serde_json::from_slice(&body).expect("parse JSON")
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

#[tokio::test]
async fn summary_returns_all_counts() {
    let app = TestApp::new().await;

    let subject = create_test_subject(app.db.as_ref(), "Physics", ExamTypeEnums::JEE).await;
    let chapter = create_test_chapter(app.db.as_ref(), subject.id, "Mechanics", 1).await;

    // Topic 1: has a quiz → published
    let t1 = create_test_topic(app.db.as_ref(), chapter.id, "Newton's Laws", 1).await;
    create_test_quiz(app.db.as_ref(), t1.id, "Mechanics Quiz").await;

    // Topic 2: no quiz → draft
    create_test_topic(app.db.as_ref(), chapter.id, "Thermodynamics", 2).await;

    // Seed recall with accuracy < 40% → flagged
    seed_topic_accuracy(app.db.as_ref(), t1.id, 3, 10).await;

    let json = get_json(&app, "/api/v1/content/dashboard/summary").await;

    assert_eq!(json["subjects_covered"], 1);
    assert_eq!(json["topics_published"], 1);
    assert_eq!(json["topics_in_draft"], 1);
    assert_eq!(json["topics_flagged"], 1);
}

#[tokio::test]
async fn summary_empty_database() {
    let app = TestApp::new().await;

    let json = get_json(&app, "/api/v1/content/dashboard/summary").await;

    assert_eq!(json["subjects_covered"], 0);
    assert_eq!(json["topics_published"], 0);
    assert_eq!(json["topics_in_draft"], 0);
    assert_eq!(json["topics_flagged"], 0);
}

#[tokio::test]
async fn summary_flag_threshold_boundary() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let topic_id = create_content_hierarchy(db, "Math", "Algebra", "Equations").await;
    // accuracy = 4/10 = 0.4 → not below 0.4
    seed_topic_accuracy(db, topic_id, 4, 10).await;

    let json = get_json(&app, "/api/v1/content/dashboard/summary").await;

    assert_eq!(json["topics_flagged"], 0);
}

#[tokio::test]
async fn summary_flag_threshold_below() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let topic_id = create_content_hierarchy(db, "Math", "Algebra", "Equations").await;
    // accuracy = 3/10 = 0.3 → below 0.4
    seed_topic_accuracy(db, topic_id, 3, 10).await;

    let json = get_json(&app, "/api/v1/content/dashboard/summary").await;

    assert_eq!(json["topics_flagged"], 1);
}

// ---------------------------------------------------------------------------
// Attention
// ---------------------------------------------------------------------------

#[tokio::test]
async fn attention_returns_items() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    for i in 0..3 {
        let topic_id = create_content_hierarchy(
            db,
            &format!("Sub{}", i),
            &format!("Ch{}", i),
            &format!("Topic{}", i),
        )
        .await;
        // accuracy 3/10 = 30% < 70% → should appear
        seed_topic_accuracy(db, topic_id, 3, 10).await;
    }

    let json = get_json(&app, "/api/v1/content/dashboard/attention").await;

    assert_eq!(json["total"], 3);
    assert_eq!(json["items"].as_array().unwrap().len(), 3);
    for item in json["items"].as_array().unwrap() {
        assert!(!item["id"].as_str().unwrap_or_default().is_empty());
        assert!(!item["topic"].as_str().unwrap_or_default().is_empty());
        assert!(!item["issue"].as_str().unwrap_or_default().is_empty());
        assert!(!item["reason"].as_str().unwrap_or_default().is_empty());
        assert!(item["students_affected"].as_i64().unwrap_or(0) > 0);
    }
}

#[tokio::test]
async fn attention_empty_when_no_recall() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;

    let json = get_json(&app, "/api/v1/content/dashboard/attention").await;

    assert_eq!(json["total"], 0);
    assert_eq!(json["items"].as_array().unwrap().len(), 0);
}

#[tokio::test]
async fn attention_empty_when_above_threshold() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let topic_id = create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;
    // accuracy 8/10 = 80% >= 70% → not flagged
    seed_topic_accuracy(db, topic_id, 8, 10).await;

    let json = get_json(&app, "/api/v1/content/dashboard/attention").await;

    assert_eq!(json["total"], 0);
}

#[tokio::test]
async fn attention_search_filter() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    for (sub, ch, name) in [
        ("PhysA", "Mechanics", "Gauss's Law"),
        ("PhysB", "Mechanics", "Newton's Laws"),
        ("Chemistry", "Thermo", "Thermodynamics"),
    ] {
        let topic_id = create_content_hierarchy(db, sub, ch, name).await;
        seed_topic_accuracy(db, topic_id, 3, 10).await;
    }

    let json = get_json(&app, "/api/v1/content/dashboard/attention?search=new").await;

    assert_eq!(json["total"], 1);
    assert_eq!(json["items"][0]["topic"], "Newton's Laws");
}

#[tokio::test]
async fn attention_issue_filter() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Create 5 topics (issues cycle Low Recall → Poor Accuracy → ...)
    for i in 0..5 {
        let topic_id = create_content_hierarchy(
            db,
            &format!("Sub{}", i),
            &format!("Ch{}", i),
            &format!("Topic{}", i),
        )
        .await;
        seed_topic_accuracy(db, topic_id, 3, 10).await;
    }

    let json = get_json(&app, "/api/v1/content/dashboard/attention?issue=Low+Recall").await;

    assert!(json["total"].as_i64().unwrap() > 0);
    for item in json["items"].as_array().unwrap() {
        assert_eq!(item["issue"], "Low Recall");
    }
}

#[tokio::test]
async fn attention_sort_by_topic_asc() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let names = ["Z Topic", "A Topic", "M Topic"];
    for (i, name) in names.iter().enumerate() {
        let topic_id = create_content_hierarchy(db, &format!("Sub{i}"), "Ch", name).await;
        seed_topic_accuracy(db, topic_id, 3, 10).await;
    }

    let json = get_json(
        &app,
        "/api/v1/content/dashboard/attention?sort_by=topic&sort_order=asc",
    )
    .await;

    let items = json["items"].as_array().unwrap();
    assert_eq!(items[0]["topic"], "A Topic");
    assert_eq!(items[2]["topic"], "Z Topic");
}

#[tokio::test]
async fn attention_pagination() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    for i in 0..25 {
        let topic_id = create_content_hierarchy(
            db,
            &format!("Sub{}", i),
            &format!("Ch{}", i),
            &format!("Topic{}", i),
        )
        .await;
        seed_topic_accuracy(db, topic_id, 3, 10).await;
    }

    for (page, expected) in [(1, 10), (2, 10), (3, 5)] {
        let json = get_json(
            &app,
            &format!("/api/v1/content/dashboard/attention?page={}&limit=10", page),
        )
        .await;

        assert_eq!(json["total"], 25, "total should be 25");
        assert_eq!(
            json["items"].as_array().unwrap().len(),
            expected,
            "page {} should have {} items",
            page,
            expected
        );
    }
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

#[tokio::test]
async fn subjects_returns_progress() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Physics: 8 topics, 6 published (75%)
    let phys = create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;
    let phys_ch = create_test_chapter(db, phys.id, "Mechanics", 1).await;
    let mut phys_topics = Vec::new();
    for i in 0..8 {
        let t = create_test_topic(db, phys_ch.id, &format!("PhysTopic{}", i), i).await;
        if i < 6 {
            create_test_quiz(db, t.id, &format!("PhysQuiz{}", i)).await;
        }
        phys_topics.push(t.id);
    }

    // Chemistry: 4 topics, 1 published (25%)
    let chem = create_test_subject(db, "Chemistry", ExamTypeEnums::JEE).await;
    let chem_ch = create_test_chapter(db, chem.id, "Organic", 1).await;
    for i in 0..4 {
        let t = create_test_topic(db, chem_ch.id, &format!("ChemTopic{}", i), i).await;
        if i == 0 {
            create_test_quiz(db, t.id, "ChemQuiz").await;
        }
    }

    let json = get_json(&app, "/api/v1/content/dashboard/subjects").await;

    let subjects = json.as_array().unwrap();
    assert_eq!(subjects.len(), 2);

    let phys_entry = subjects.iter().find(|s| s["name"] == "Physics").unwrap();
    assert_eq!(phys_entry["completion"], 75.0);
    assert_eq!(phys_entry["total_topics"], 8);
    assert_eq!(phys_entry["published_topics"], 6);
    assert_eq!(phys_entry["draft_topics"], 2);

    let chem_entry = subjects.iter().find(|s| s["name"] == "Chemistry").unwrap();
    assert_eq!(chem_entry["completion"], 25.0);
}

#[tokio::test]
async fn subjects_empty() {
    let app = TestApp::new().await;

    let json = get_json(&app, "/api/v1/content/dashboard/subjects").await;

    assert!(json.as_array().unwrap().is_empty());
}

#[tokio::test]
async fn subjects_no_topics() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    create_test_subject(db, "Physics", ExamTypeEnums::JEE).await;

    let json = get_json(&app, "/api/v1/content/dashboard/subjects").await;

    assert_eq!(json.as_array().unwrap().len(), 1);
    assert_eq!(json[0]["completion"], 0.0);
    assert_eq!(json[0]["total_topics"], 0);
}

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

#[tokio::test]
async fn signals_classifies_correctly() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    // Scores: TopicA=90%, TopicB=50%, TopicC=10%
    // mean=50, variance=1066.67, std≈32.66
    // upper=66.33, lower=33.67
    // highest: TopicA (90 > 66.33), decay: TopicC (10 < 33.67)
    let topics_data = [("TopicA", 9, 10), ("TopicB", 5, 10), ("TopicC", 1, 10)];
    for (i, (name, correct, total)) in topics_data.iter().enumerate() {
        let topic_id = create_content_hierarchy(db, &format!("SigSub{i}"), "Ch", name).await;
        seed_topic_accuracy(db, topic_id, *correct, *total).await;
    }

    let json = get_json(&app, "/api/v1/content/dashboard/signals").await;

    let highest = json["highest_recall"].as_array().unwrap();
    let decay = json["fastest_decay"].as_array().unwrap();

    assert_eq!(highest.len(), 1);
    assert_eq!(highest[0]["topic"], "TopicA");
    assert!(highest[0]["score"].as_f64().unwrap() > 0.0);
    assert!(highest[0]["drop"].is_null());

    assert_eq!(decay.len(), 1);
    assert_eq!(decay[0]["topic"], "TopicC");
    assert!(decay[0]["drop"].as_f64().unwrap() > 0.0);
    assert!(decay[0]["score"].is_null());
}

#[tokio::test]
async fn signals_empty() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();
    create_content_hierarchy(db, "Physics", "Mechanics", "Newton's Laws").await;

    let json = get_json(&app, "/api/v1/content/dashboard/signals").await;

    assert!(json["highest_recall"].as_array().unwrap().is_empty());
    assert!(json["fastest_decay"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn signals_all_equal() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    for (i, name) in ["TopicA", "TopicB", "TopicC"].iter().enumerate() {
        let topic_id = create_content_hierarchy(db, &format!("EqSub{i}"), "Ch", name).await;
        seed_topic_accuracy(db, topic_id, 8, 10).await;
    }

    let json = get_json(&app, "/api/v1/content/dashboard/signals").await;

    assert!(json["highest_recall"].as_array().unwrap().is_empty());
    assert!(json["fastest_decay"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn signals_returns_200_with_valid_header() {
    let app = TestApp::new().await;

    let response = app.get("/api/v1/content/dashboard/signals").await;
    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert!(json.get("highest_recall").is_some());
    assert!(json.get("fastest_decay").is_some());
}

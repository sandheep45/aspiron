use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::DatabaseConnection;
use uuid::Uuid;

use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::context::TestUser;
use crate::fixtures::helpers::{
    create_test_chapter, create_test_completed_recall_session, create_test_learning_progress,
    create_test_recall_answer_variant, create_test_subject, create_test_topic, create_test_user,
    ensure_analytics_permission,
};
use crate::harness::{TestApp, extract_jwt_cookie};

/// Create an admin user that has the VIEW_ANALYTICS permission.
async fn create_admin_with_analytics(db: &DatabaseConnection) -> TestUser {
    ensure_analytics_permission(db).await;
    create_test_user(db, "admin@test.com", "admin123", UserTypeEnums::ADMIN).await
}

/// Login and return the auth cookie.
async fn login(app: &TestApp, email: &str, password: &str) -> String {
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({ "email": email, "password": password }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    extract_jwt_cookie(&login)
}

/// Create a content hierarchy: subject → chapter → topic.
async fn create_content_hierarchy(
    db: &DatabaseConnection,
    subject_name: &str,
    chapter_name: &str,
    topic_name: &str,
) -> Uuid {
    let subject = create_test_subject(
        db,
        subject_name,
        backend::entries::entity_enums::exam_types::ExamTypeEnums::JEE,
    )
    .await;
    let chapter = create_test_chapter(db, subject.id, chapter_name, 1).await;
    let topic = create_test_topic(db, chapter.id, topic_name, 1).await;
    topic.id
}

// ---------------------------------------------------------------------------
// Auth tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn critical_issues_requires_auth() {
    let app = TestApp::new().await;
    let response = app.get("/api/v1/admin/insights/pain-points/critical").await;
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn pain_points_requires_auth() {
    let app = TestApp::new().await;
    let response = app
        .get("/api/v1/admin/insights/pain-points?page=1&limit=10")
        .await;
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn pattern_insights_requires_auth() {
    let app = TestApp::new().await;
    let response = app.get("/api/v1/admin/insights/pain-points/insights").await;
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn topic_detail_requires_auth() {
    let app = TestApp::new().await;
    let response = app
        .get(&format!(
            "/api/v1/admin/insights/pain-points/{}",
            Uuid::new_v4()
        ))
        .await;
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

// ---------------------------------------------------------------------------
// Permission tests
// ---------------------------------------------------------------------------

#[tokio::test]
async fn all_endpoints_return_403_without_view_analytics() {
    let app = TestApp::new().await;

    let user = create_test_user(
        app.db.as_ref(),
        "student@test.com",
        "pass",
        UserTypeEnums::STUDENT,
    )
    .await;
    let cookie = login(&app, &user.email, "pass").await;

    let endpoints = [
        "/api/v1/admin/insights/pain-points/critical",
        "/api/v1/admin/insights/pain-points?page=1&limit=10",
        "/api/v1/admin/insights/pain-points/insights",
        &format!("/api/v1/admin/insights/pain-points/{}", Uuid::new_v4()),
    ];

    for ep in &endpoints {
        let response = app.get_with_cookie(ep, &cookie).await;
        assert_eq!(response.status(), StatusCode::FORBIDDEN);
        let body = to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("read body");
        let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
        assert_eq!(json["error"]["code"], "UNAUTHORIZED");
    }
}

// ---------------------------------------------------------------------------
// Data-driven: Critical issues
// ---------------------------------------------------------------------------

async fn seed_topic_with_accuracy(
    db: &DatabaseConnection,
    users: &[TestUser],
    topic_id: Uuid,
    correct_count: usize,
    total_answers: usize,
) {
    for user in users {
        create_test_learning_progress(db, user.id, topic_id, 50).await;
        let session = create_test_completed_recall_session(db, user.id, topic_id).await;
        for i in 0..total_answers {
            create_test_recall_answer_variant(
                db,
                session.id,
                backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
                i < correct_count,
                if i < correct_count { Some(1) } else { Some(0) },
            )
            .await;
        }
    }
}

#[tokio::test]
async fn critical_issues_filters_and_limits() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;

    let students = [
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await,
        create_test_user(app.db.as_ref(), "s2@t.com", "pass", UserTypeEnums::STUDENT).await,
        create_test_user(app.db.as_ref(), "s3@t.com", "pass", UserTypeEnums::STUDENT).await,
        create_test_user(app.db.as_ref(), "s4@t.com", "pass", UserTypeEnums::STUDENT).await,
        create_test_user(app.db.as_ref(), "s5@t.com", "pass", UserTypeEnums::STUDENT).await,
    ];

    let mut topic_ids = Vec::new();
    for i in 0..8 {
        let db = app.db.as_ref();
        let subject = create_test_subject(
            db,
            &format!("Sub{}", i),
            backend::entries::entity_enums::exam_types::ExamTypeEnums::JEE,
        )
        .await;
        let chapter = create_test_chapter(db, subject.id, &format!("Ch{}", i), 1).await;
        let topic = create_test_topic(db, chapter.id, &format!("Topic{}", i), 1).await;
        topic_ids.push(topic.id);
    }

    // topics[0-2]: critical (accuracy < 25%) — 4/20 = 20%, 3/15 = 20%, 2/10 = 20%
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[0], 4, 20).await;
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[1], 3, 15).await;
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[2], 2, 10).await;

    // topics[3-7]: non-critical (accuracy >= 25%)
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[3], 5, 15).await; // 33%
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[4], 6, 15).await; // 40%
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[5], 8, 15).await; // 53%
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[6], 10, 15).await; // 66%
    seed_topic_with_accuracy(app.db.as_ref(), &students, topic_ids[7], 14, 15).await; // 93%

    let response = app
        .get_with_cookie("/api/v1/admin/insights/pain-points/critical", &cookie)
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

    assert_eq!(json["total_urgent"], 3, "should have 3 critical issues");
    let issues = json["issues"].as_array().expect("issues array");
    assert!(issues.len() <= 5, "capped at 5");
    for issue in issues {
        assert_eq!(issue["severity"], "critical");
    }
}

#[tokio::test]
async fn critical_issues_empty_when_no_critical() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;

    let student =
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await;
    let topic_id = create_content_hierarchy(app.db.as_ref(), "Math", "Algebra", "Equations").await;
    // 80% accuracy → not critical
    let session = create_test_completed_recall_session(app.db.as_ref(), student.id, topic_id).await;
    for _ in 0..10 {
        create_test_recall_answer_variant(
            app.db.as_ref(),
            session.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(1),
        )
        .await;
    }

    let response = app
        .get_with_cookie("/api/v1/admin/insights/pain-points/critical", &cookie)
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

    assert_eq!(json["total_urgent"], 0);
    assert_eq!(json["issues"].as_array().expect("issues array").len(), 0);
}

// ---------------------------------------------------------------------------
// Data-driven: Pain points list
// ---------------------------------------------------------------------------

#[tokio::test]
async fn pain_points_pagination() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;

    let student =
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await;

    // Create 25 topics
    for i in 0..25 {
        let topic_id = create_content_hierarchy(
            app.db.as_ref(),
            &format!("Sub{}", i),
            &format!("Ch{}", i),
            &format!("Topic{}", i),
        )
        .await;
        create_test_learning_progress(app.db.as_ref(), student.id, topic_id, 50).await;
        let session =
            create_test_completed_recall_session(app.db.as_ref(), student.id, topic_id).await;
        create_test_recall_answer_variant(
            app.db.as_ref(),
            session.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            i % 2 == 0,
            Some(if i % 2 == 0 { 1 } else { 0 }),
        )
        .await;
    }

    for (page, expected) in [(1, 10), (2, 10), (3, 5)] {
        let response = app
            .get_with_cookie(
                &format!("/api/v1/admin/insights/pain-points?page={}&limit=10", page),
                &cookie,
            )
            .await;
        assert_eq!(response.status(), StatusCode::OK);

        let body = to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("read body");
        let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

        assert_eq!(json["total"], 25);
        assert_eq!(
            json["items"].as_array().expect("items array").len(),
            expected,
            "page {} should have {} items",
            page,
            expected
        );
    }
}

#[tokio::test]
async fn pain_points_search_filter() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;
    let student =
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await;

    let subjects = ["Math", "Biology", "Physics"];
    let chapters = ["Algebra", "Botany", "Mechanics"];
    let names = ["Quadratic Equations", "Photosynthesis", "Newton's Laws"];
    for (i, name) in names.iter().enumerate() {
        let topic_id =
            create_content_hierarchy(app.db.as_ref(), subjects[i], chapters[i], name).await;
        create_test_learning_progress(app.db.as_ref(), student.id, topic_id, 50).await;
        let session =
            create_test_completed_recall_session(app.db.as_ref(), student.id, topic_id).await;
        create_test_recall_answer_variant(
            app.db.as_ref(),
            session.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(1),
        )
        .await;
    }

    // Search for "Quad"
    let response = app
        .get_with_cookie(
            "/api/v1/admin/insights/pain-points?search=Quad&page=1&limit=10",
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let items = json["items"].as_array().expect("items array");
    assert_eq!(items.len(), 1, "should find 1 topic matching 'Quad'");

    // Search for non-existent
    let response = app
        .get_with_cookie(
            "/api/v1/admin/insights/pain-points?search=xyzzy&page=1&limit=10",
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let items = json["items"].as_array().expect("items array");
    assert_eq!(items.len(), 0, "should find 0 topics matching 'xyzzy'");
}

#[tokio::test]
async fn pain_points_severity_filter() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;
    let student =
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await;

    // Topic 1: Weak (0/2 correct = 0%)
    let t1 = create_content_hierarchy(app.db.as_ref(), "SubA", "ChA", "WeakTopic").await;
    create_test_learning_progress(app.db.as_ref(), student.id, t1, 50).await;
    let s1 = create_test_completed_recall_session(app.db.as_ref(), student.id, t1).await;
    create_test_recall_answer_variant(app.db.as_ref(), s1.id, backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ, false, Some(0)).await;
    create_test_recall_answer_variant(app.db.as_ref(), s1.id, backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ, false, Some(0)).await;

    // Topic 2: Strong (2/2 correct = 100%)
    let t2 = create_content_hierarchy(app.db.as_ref(), "SubB", "ChB", "StrongTopic").await;
    create_test_learning_progress(app.db.as_ref(), student.id, t2, 50).await;
    let s2 = create_test_completed_recall_session(app.db.as_ref(), student.id, t2).await;
    create_test_recall_answer_variant(app.db.as_ref(), s2.id, backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ, true, Some(1)).await;
    create_test_recall_answer_variant(app.db.as_ref(), s2.id, backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ, true, Some(1)).await;

    // Filter Weak (Display impl uses lowercase: "weak")
    let response = app
        .get_with_cookie(
            "/api/v1/admin/insights/pain-points?severity=weak&page=1&limit=10",
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let items = json["items"].as_array().expect("items array");
    assert_eq!(items.len(), 1, "Weak filter should return 1 topic");

    // Filter Strong (Display impl uses lowercase: "strong")
    let response = app
        .get_with_cookie(
            "/api/v1/admin/insights/pain-points?severity=strong&page=1&limit=10",
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let items = json["items"].as_array().expect("items array");
    assert_eq!(items.len(), 1, "Strong filter should return 1 topic");
}

// ---------------------------------------------------------------------------
// Data-driven: Pattern insights
// ---------------------------------------------------------------------------

#[tokio::test]
async fn pattern_insights_returns_metrics() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;
    let student =
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await;

    // Seed a topic with recall data so get_topic_performance returns results
    let topic_id =
        create_content_hierarchy(app.db.as_ref(), "Science", "Physics", "Kinematics").await;
    create_test_learning_progress(app.db.as_ref(), student.id, topic_id, 50).await;
    let session = create_test_completed_recall_session(app.db.as_ref(), student.id, topic_id).await;
    for _ in 0..5 {
        create_test_recall_answer_variant(
            app.db.as_ref(),
            session.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(1),
        )
        .await;
    }

    let response = app
        .get_with_cookie("/api/v1/admin/insights/pain-points/insights", &cookie)
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let insights = json["insights"].as_array().expect("insights array");

    assert_eq!(insights.len(), 4);
    for insight in insights {
        assert!(insight["id"].as_str().is_some_and(|s| !s.is_empty()));
        assert!(insight["title"].as_str().is_some_and(|s| !s.is_empty()));
        assert!(insight["metric"].as_str().is_some_and(|s| !s.is_empty()));
    }
}

// ---------------------------------------------------------------------------
// Data-driven: Topic detail
// ---------------------------------------------------------------------------

#[tokio::test]
async fn topic_detail_returns_full_data() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;
    let student =
        create_test_user(app.db.as_ref(), "s1@t.com", "pass", UserTypeEnums::STUDENT).await;

    let topic_id =
        create_content_hierarchy(app.db.as_ref(), "Physics", "Mechanics", "Newton's Laws").await;
    create_test_learning_progress(app.db.as_ref(), student.id, topic_id, 50).await;
    let session = create_test_completed_recall_session(app.db.as_ref(), student.id, topic_id).await;
    // 3 correct + 2 wrong = 60% accuracy
    for _ in 0..3 {
        create_test_recall_answer_variant(
            app.db.as_ref(),
            session.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            true,
            Some(1),
        )
        .await;
    }
    for _ in 0..2 {
        create_test_recall_answer_variant(
            app.db.as_ref(),
            session.id,
            backend::entries::entity_enums::learning_recall_question_type::LearningRecallQuestionTypeEnum::MCQ,
            false,
            Some(0),
        )
        .await;
    }

    let response = app
        .get_with_cookie(
            &format!("/api/v1/admin/insights/pain-points/{}", topic_id),
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

    assert_eq!(json["topic"], "Newton's Laws", "topic name matches");
    assert!(json["accuracy"].as_f64().is_some(), "accuracy is a number");
    assert!(
        json["trend"].as_str().is_some_and(|s| !s.is_empty()),
        "trend is non-empty"
    );
    assert!(
        json["common_mistakes"].is_array(),
        "common_mistakes is array"
    );
    assert!(json["weak_questions"].is_array(), "weak_questions is array");
    assert!(
        json["recommendations"].is_array(),
        "recommendations is array"
    );
    assert_eq!(
        json["recommendations"].as_array().map(|a| a.len()),
        Some(3),
        "3 recommendations"
    );
}

#[tokio::test]
async fn topic_detail_returns_404() {
    let app = TestApp::new().await;
    create_admin_with_analytics(app.db.as_ref()).await;
    let cookie = login(&app, "admin@test.com", "admin123").await;

    let response = app
        .get_with_cookie(
            &format!("/api/v1/admin/insights/pain-points/{}", Uuid::new_v4()),
            &cookie,
        )
        .await;
    assert_eq!(response.status(), StatusCode::NOT_FOUND);

    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["error"]["code"], "NOT_FOUND");
}

use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::helpers::{self as sc_helpers, TestAppExt};
use crate::scenarios::scenario_builder::ScenarioBuilder;

#[tokio::test]
async fn note_sharing_teacher_creates_note_student_threads() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("ns_teacher@test.com", "pass", UserTypeEnums::TEACHER)
        .with_user("ns_student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Biology", ExamTypeEnums::NEET)
        .chapter("Genetics")
        .topic("DNA Replication")
        .build()
        .await;

    let teacher = ctx.user(&UserTypeEnums::TEACHER);
    let student = ctx.user(&UserTypeEnums::STUDENT);
    let topic_id = ctx.topic_id();

    let teacher_login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": teacher.email,
                "password": "pass",
            }),
        )
        .await;
    assert_eq!(teacher_login.status(), StatusCode::OK);
    let teacher_cookie = extract_jwt_cookie(&teacher_login);

    let student_login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "pass",
            }),
        )
        .await;
    assert_eq!(student_login.status(), StatusCode::OK);
    let student_cookie = extract_jwt_cookie(&student_login);

    let note_resp = app
        .post_json_with_cookie(
            "/api/v1/notes",
            serde_json::json!({
                "topic_id": topic_id,
                "title": "Key DNA Replication Concepts",
                "content": "DNA replication is semi-conservative...",
            }),
            &teacher_cookie,
        )
        .await;
    assert_eq!(note_resp.status(), StatusCode::OK);

    let thread_resp = app
        .post_json_with_cookie(
            "/api/v1/community/threads",
            serde_json::json!({
                "title": "Question about DNA Replication",
                "content": "Can someone explain Okazaki fragments?",
                "topic_id": topic_id,
            }),
            &student_cookie,
        )
        .await;
    assert_eq!(thread_resp.status(), StatusCode::OK);
    let body = to_bytes(thread_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let thread: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    let thread_id = thread["id"].as_str().expect("thread id");

    let get_threads = app
        .get_with_cookie(
            &format!("/api/v1/community/topics/{}/threads", topic_id),
            &student_cookie,
        )
        .await;
    assert_eq!(get_threads.status(), StatusCode::OK);

    let post_resp = app
        .post_json_with_cookie(
            &format!("/api/v1/community/threads/{}/posts", thread_id),
            serde_json::json!({ "content": "Okazaki fragments are formed on the lagging strand..." }),
            &student_cookie,
        )
        .await;
    assert_eq!(post_resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn note_sharing_multiple_posts_in_thread() {
    let app = TestApp::new().await;
    let db = app.db.as_ref();

    let ctx = ScenarioBuilder::new(db)
        .with_user("ns2_teacher@test.com", "pass", UserTypeEnums::TEACHER)
        .with_user("ns2_student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Optics")
        .topic("Lens Formula")
        .build()
        .await;

    let student = ctx.user(&UserTypeEnums::STUDENT);
    let topic_id = ctx.topic_id();

    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "pass",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    let cookie = extract_jwt_cookie(&login);

    let thread =
        sc_helpers::create_test_thread(db, student.id, topic_id, "Lens formula help").await;

    let thread_by_id = app
        .get_with_cookie(&format!("/api/v1/community/threads/{}", thread.id), &cookie)
        .await;
    assert_eq!(thread_by_id.status(), StatusCode::OK);

    let post1 = app
        .post_json_with_cookie(
            &format!("/api/v1/community/threads/{}/posts", thread.id),
            serde_json::json!({ "content": "What is the lens formula?" }),
            &cookie,
        )
        .await;
    assert_eq!(post1.status(), StatusCode::OK);

    let post2 = app
        .post_json_with_cookie(
            &format!("/api/v1/community/threads/{}/posts", thread.id),
            serde_json::json!({ "content": "1/f = 1/v - 1/u" }),
            &cookie,
        )
        .await;
    assert_eq!(post2.status(), StatusCode::OK);

    let get_threads = app
        .get_with_cookie(
            &format!("/api/v1/community/topics/{}/threads", topic_id),
            &cookie,
        )
        .await;
    assert_eq!(get_threads.status(), StatusCode::OK);
}

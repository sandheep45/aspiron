use axum::{body::to_bytes, http::StatusCode};

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::scenario_builder::ScenarioBuilder;

#[tokio::test]
async fn scenario_quiz_lifecycle_create_student_and_quiz() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("student@aspiron.test", "pass123", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Mechanics")
        .topic("Newton's Laws")
        .quiz("Mechanics Quiz")
        .questions(5)
        .build()
        .await;

    let student = ctx
        .users
        .get(&UserTypeEnums::STUDENT)
        .expect("student should exist");
    assert_eq!(student.email, "student@aspiron.test");

    let _subject = ctx.subject.as_ref().expect("subject should exist");

    let _chapter = ctx.chapter.as_ref().expect("chapter should exist");

    let _topic = ctx.topic.as_ref().expect("topic should exist");

    let quiz = ctx.quiz.as_ref().expect("quiz should exist");

    // Verify the quiz endpoint returns 200
    let quiz_response = app.get(&format!("/api/v1/quizzes/{}", quiz.id)).await;
    assert_eq!(quiz_response.status(), StatusCode::OK);

    // Verify the user can login via HTTP
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "pass123",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);

    let cookie = extract_jwt_cookie(&login);
    assert!(cookie.contains('='), "cookie should have name=value");

    // Verify /me works with the cookie
    let me = app.get_with_cookie("/api/v1/auth/me", &cookie).await;
    assert_eq!(me.status(), StatusCode::OK);

    let body = to_bytes(me.into_body(), usize::MAX)
        .await
        .expect("read body");
    let body: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(body["data"]["user"]["email"], student.email);
}

#[tokio::test]
async fn scenario_quiz_lifecycle_with_recall_session() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("student2@aspiron.test", "pass456", UserTypeEnums::STUDENT)
        .subject("Chemistry", ExamTypeEnums::NEET)
        .chapter("Thermodynamics")
        .topic("First Law")
        .quiz("Thermo Quiz")
        .questions(3)
        .recall_session()
        .build()
        .await;

    assert!(ctx.recall_session.is_some(), "recall session should exist");
    assert!(ctx.quiz.is_some(), "quiz should exist");

    let _recall = ctx.recall_session.as_ref().unwrap();
    let quiz_response = app
        .get(&format!(
            "/api/v1/quizzes/{}",
            ctx.quiz.as_ref().unwrap().id
        ))
        .await;
    assert_eq!(quiz_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn scenario_multi_user_student_and_teacher() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("student@multi.test", "pass1", UserTypeEnums::STUDENT)
        .with_user("teacher@multi.test", "pass2", UserTypeEnums::TEACHER)
        .subject("Math", ExamTypeEnums::JEE)
        .chapter("Algebra")
        .topic("Quadratic Equations")
        .build()
        .await;

    assert_eq!(ctx.users.len(), 2, "should have two users");

    let student = ctx.users.get(&UserTypeEnums::STUDENT).expect("student");
    let teacher = ctx.users.get(&UserTypeEnums::TEACHER).expect("teacher");

    // Both can login
    for (user, password) in [(&student, "pass1"), (&teacher, "pass2")] {
        let login = app
            .post_json(
                "/api/v1/auth/login",
                serde_json::json!({
                    "email": user.email,
                    "password": password,
                }),
            )
            .await;
        assert_eq!(
            login.status(),
            StatusCode::OK,
            "{} should login",
            user.email
        );
    }
}

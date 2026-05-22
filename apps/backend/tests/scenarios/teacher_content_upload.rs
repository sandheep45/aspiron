use axum::{body::to_bytes, http::StatusCode};

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::fixtures::scenario_builder::ScenarioBuilder;
use crate::harness::{TestApp, extract_jwt_cookie};

#[tokio::test]
async fn teacher_logs_in_and_has_teacher_role() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("teacher@aspiron.test", "teach123", UserTypeEnums::TEACHER)
        .build()
        .await;

    let teacher = ctx.users.get(&UserTypeEnums::TEACHER).unwrap();

    // Login
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": teacher.email,
                "password": "teach123",
            }),
        )
        .await;
    assert_eq!(
        login.status(),
        StatusCode::OK,
        "teacher login should succeed"
    );

    let cookie = extract_jwt_cookie(&login);

    // Verify teacher role in /me response
    let me = app.get_with_cookie("/api/v1/auth/me", &cookie).await;
    assert_eq!(me.status(), StatusCode::OK);

    let body = to_bytes(me.into_body(), usize::MAX)
        .await
        .expect("read body");
    let body: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

    let roles = body["data"]["roles"]
        .as_array()
        .expect("roles should be an array");
    let teacher_roles: Vec<&str> = roles
        .iter()
        .filter_map(|r| r["name"].as_str())
        .filter(|name| *name == "TEACHER")
        .collect();
    assert!(
        !teacher_roles.is_empty(),
        "teacher should have TEACHER role"
    );
}

#[tokio::test]
async fn teacher_and_student_have_different_roles() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("teacher@role.test", "pass1", UserTypeEnums::TEACHER)
        .with_user("student@role.test", "pass2", UserTypeEnums::STUDENT)
        .subject("Biology", ExamTypeEnums::NEET)
        .chapter("Cell Biology")
        .topic("Mitosis")
        .build()
        .await;

    // Login as teacher
    let teacher = ctx.users.get(&UserTypeEnums::TEACHER).unwrap();
    let teacher_login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": teacher.email,
                "password": "pass1",
            }),
        )
        .await;
    assert_eq!(teacher_login.status(), StatusCode::OK);
    let teacher_cookie = extract_jwt_cookie(&teacher_login);

    let teacher_me = app
        .get_with_cookie("/api/v1/auth/me", &teacher_cookie)
        .await;
    let teacher_body = to_bytes(teacher_me.into_body(), usize::MAX)
        .await
        .expect("read body");
    let teacher_body: serde_json::Value =
        serde_json::from_slice(&teacher_body).expect("parse JSON");

    let teacher_roles: Vec<&str> = teacher_body["data"]["roles"]
        .as_array()
        .expect("roles array")
        .iter()
        .filter_map(|r| r["name"].as_str())
        .collect();
    assert!(
        teacher_roles.contains(&"TEACHER"),
        "teacher should have TEACHER role, got: {:?}",
        teacher_roles
    );

    // Login as student
    let student = ctx.users.get(&UserTypeEnums::STUDENT).unwrap();
    let student_login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": student.email,
                "password": "pass2",
            }),
        )
        .await;
    assert_eq!(student_login.status(), StatusCode::OK);
    let student_cookie = extract_jwt_cookie(&student_login);

    let student_me = app
        .get_with_cookie("/api/v1/auth/me", &student_cookie)
        .await;
    let student_body = to_bytes(student_me.into_body(), usize::MAX)
        .await
        .expect("read body");
    let student_body: serde_json::Value =
        serde_json::from_slice(&student_body).expect("parse JSON");

    let student_roles: Vec<&str> = student_body["data"]["roles"]
        .as_array()
        .expect("roles array")
        .iter()
        .filter_map(|r| r["name"].as_str())
        .collect();
    assert!(
        student_roles.contains(&"STUDENT"),
        "student should have STUDENT role, got: {:?}",
        student_roles
    );

    // Roles should be different
    assert_ne!(
        teacher_roles, student_roles,
        "teacher and student should have different roles"
    );
}

#[tokio::test]
async fn teacher_can_lookup_user_by_email() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("admin@lookup.test", "admin123", UserTypeEnums::ADMIN)
        .with_user("target@lookup.test", "target123", UserTypeEnums::STUDENT)
        .build()
        .await;

    let admin = ctx.users.get(&UserTypeEnums::ADMIN).unwrap();
    let target = ctx.users.get(&UserTypeEnums::STUDENT).unwrap();

    // Login as admin
    let login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({
                "email": admin.email,
                "password": "admin123",
            }),
        )
        .await;
    assert_eq!(login.status(), StatusCode::OK);
    let cookie = extract_jwt_cookie(&login);

    // Look up student by email
    let lookup = app
        .get_with_cookie(&format!("/api/v1/users?email={}", target.email), &cookie)
        .await;
    assert_eq!(
        lookup.status(),
        StatusCode::OK,
        "user lookup should succeed"
    );

    let body = to_bytes(lookup.into_body(), usize::MAX)
        .await
        .expect("read body");
    let body: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");

    assert_eq!(body["email"], target.email);
    assert_eq!(body["id"], target.id.to_string());
}

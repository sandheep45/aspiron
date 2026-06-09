use axum::body::to_bytes;
use axum::http::StatusCode;

use backend::entries::entity_enums::exam_types::ExamTypeEnums;
use backend::entries::entity_enums::user_types::UserTypeEnums;

use crate::harness::{TestApp, extract_jwt_cookie};
use crate::scenarios::scenario_builder::ScenarioBuilder;

#[tokio::test]
async fn permission_evolution_role_listing() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("pe_admin@test.com", "pass", UserTypeEnums::ADMIN)
        .with_user("pe_student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Physics", ExamTypeEnums::JEE)
        .chapter("Optics")
        .topic("Refraction")
        .build()
        .await;

    let admin = ctx.user(&UserTypeEnums::ADMIN);
    let student = ctx.user(&UserTypeEnums::STUDENT);

    let admin_login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({ "email": admin.email, "password": "pass" }),
        )
        .await;
    assert_eq!(admin_login.status(), StatusCode::OK);
    let admin_cookie = extract_jwt_cookie(&admin_login);

    let student_login = app
        .post_json(
            "/api/v1/auth/login",
            serde_json::json!({ "email": student.email, "password": "pass" }),
        )
        .await;
    assert_eq!(student_login.status(), StatusCode::OK);
    let student_cookie = extract_jwt_cookie(&student_login);

    let roles_resp = app
        .get_with_cookie("/api/v1/rbac/roles", &admin_cookie)
        .await;
    assert_eq!(roles_resp.status(), StatusCode::OK);
    let body = to_bytes(roles_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let roles: Vec<serde_json::Value> = serde_json::from_slice(&body).expect("parse JSON");
    assert!(!roles.is_empty(), "should have at least one role");

    let first_role_id = roles[0]["id"].as_str().expect("role id");

    let role_resp = app
        .get_with_cookie(
            &format!("/api/v1/rbac/roles/{}", first_role_id),
            &admin_cookie,
        )
        .await;
    assert_eq!(role_resp.status(), StatusCode::OK);

    let perms_resp = app
        .get_with_cookie(
            &format!("/api/v1/rbac/roles/{}/permissions", first_role_id),
            &admin_cookie,
        )
        .await;
    assert_eq!(perms_resp.status(), StatusCode::OK);

    let all_perms = app
        .get_with_cookie("/api/v1/rbac/permissions", &admin_cookie)
        .await;
    assert_eq!(all_perms.status(), StatusCode::OK);

    let user_roles = app
        .get_with_cookie(
            &format!("/api/v1/rbac/users/{}/roles", student.id),
            &student_cookie,
        )
        .await;
    assert_eq!(user_roles.status(), StatusCode::OK);
}

#[tokio::test]
async fn permission_evolution_user_role_lookup() {
    let app = TestApp::new().await;

    let ctx = ScenarioBuilder::new(app.db.as_ref())
        .with_user("pe2_admin@test.com", "pass", UserTypeEnums::ADMIN)
        .with_user("pe2_teacher@test.com", "pass", UserTypeEnums::TEACHER)
        .with_user("pe2_student@test.com", "pass", UserTypeEnums::STUDENT)
        .subject("Chemistry", ExamTypeEnums::NEET)
        .chapter("Organic")
        .topic("Hydrocarbons")
        .build()
        .await;

    let admin = ctx.user(&UserTypeEnums::ADMIN);
    let teacher = ctx.user(&UserTypeEnums::TEACHER);
    let student = ctx.user(&UserTypeEnums::STUDENT);

    for user in [admin, teacher, student] {
        let login = app
            .post_json(
                "/api/v1/auth/login",
                serde_json::json!({ "email": user.email, "password": "pass" }),
            )
            .await;
        assert_eq!(
            login.status(),
            StatusCode::OK,
            "{} should login",
            user.email
        );
        let cookie = extract_jwt_cookie(&login);

        let user_roles = app
            .get_with_cookie(&format!("/api/v1/rbac/users/{}/roles", user.id), &cookie)
            .await;
        assert_eq!(user_roles.status(), StatusCode::OK);
    }
}

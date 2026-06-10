use axum::body::to_bytes;
use axum::http::StatusCode;
use sea_orm::{ActiveModelTrait, DatabaseConnection, EntityTrait};
use uuid::Uuid;

use crate::fixtures::helpers::{
    create_test_ai_note, create_test_chapter, create_test_reference, create_test_subject,
    create_test_teacher_note, create_test_topic,
};
use crate::harness::TestApp;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

use backend::entries::entities::learning_notes;

async fn get_json(app: &TestApp, path: &str) -> (StatusCode, serde_json::Value) {
    let response = app.get(path).await;
    let status = response.status();
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    (status, json)
}

// ---------------------------------------------------------------------------
// Overview endpoint (3 tests)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_returns_counts_when_notes_exist() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Overview Test",
        "Overview Chapter",
        "Overview Topic",
    )
    .await;

    create_test_teacher_note(app.db.as_ref(), topic_id, "Teacher content", "draft").await;
    create_test_ai_note(
        app.db.as_ref(),
        topic_id,
        "AI Summary",
        "AI generated content",
        "pending_review",
    )
    .await;
    create_test_reference(
        app.db.as_ref(),
        topic_id,
        "Ref 1",
        "https://example.com/1",
        "URL",
        "https://example.com/1",
        true,
    )
    .await;
    create_test_reference(
        app.db.as_ref(),
        topic_id,
        "Ref 2",
        "https://example.com/2",
        "URL",
        "https://example.com/2",
        true,
    )
    .await;

    let (status, json) =
        get_json(&app, &format!("/api/v1/topics/{}/notes/overview", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["teacher_notes_status"], "draft");
    assert_eq!(json["ai_notes_status"], "pending_review");
    assert_eq!(json["external_references_count"], 2);
    assert!(json["student_engagement"].as_i64().is_some());
}

#[tokio::test]
async fn overview_returns_zeros_when_no_notes() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Empty Overview",
        "Empty Chapter",
        "Empty Topic",
    )
    .await;

    let (status, json) =
        get_json(&app, &format!("/api/v1/topics/{}/notes/overview", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["teacher_notes_status"], "draft");
    assert_eq!(json["ai_notes_status"], "none");
    assert_eq!(json["external_references_count"], 0);
}

#[tokio::test]
async fn overview_excludes_soft_deleted_items() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Soft Delete",
        "Soft Delete Chapter",
        "Soft Delete Topic",
    )
    .await;

    let ref_note = create_test_reference(
        app.db.as_ref(),
        topic_id,
        "To Delete",
        "https://example.com/todelete",
        "URL",
        "https://example.com/todelete",
        true,
    )
    .await;

    // Soft-delete the reference
    let mut active: learning_notes::ActiveModel = learning_notes::Entity::find_by_id(ref_note.id)
        .one(app.db.as_ref())
        .await
        .expect("find reference")
        .expect("reference exists")
        .into();
    active.deleted_at = sea_orm::Set(Some(chrono::Utc::now().into()));
    active
        .update(app.db.as_ref())
        .await
        .expect("soft delete reference");

    let (status, json) =
        get_json(&app, &format!("/api/v1/topics/{}/notes/overview", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["external_references_count"], 0);
}

// ---------------------------------------------------------------------------
// Teacher notes (5 tests)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn teacher_notes_returns_empty_when_missing() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Teacher Notes",
        "Teacher Chapter",
        "Empty Teacher Topic",
    )
    .await;

    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/notes", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["content"], "");
    assert_eq!(json["status"], "draft");
    assert_eq!(json["id"], "");
}

#[tokio::test]
async fn teacher_notes_returns_content_when_exists() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Teacher Notes",
        "Teacher Chapter",
        "Existing Teacher",
    )
    .await;

    create_test_teacher_note(app.db.as_ref(), topic_id, "Hello teacher content", "draft").await;

    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/notes", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(json["content"], "Hello teacher content");
    assert_eq!(json["status"], "draft");
    assert!(!json["id"].as_str().unwrap().is_empty());
}

#[tokio::test]
async fn update_teacher_note_creates_new() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Teacher Notes",
        "Teacher Chapter",
        "Create New",
    )
    .await;

    let response = app
        .put_json(
            &format!("/api/v1/topics/{}/notes", topic_id),
            serde_json::json!({
                "content": "Newly created note content",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["content"], "Newly created note content");
    assert_eq!(json["status"], "draft");
}

#[tokio::test]
async fn update_teacher_note_updates_existing() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Teacher Notes",
        "Teacher Chapter",
        "Update Existing",
    )
    .await;

    create_test_teacher_note(app.db.as_ref(), topic_id, "Original content", "draft").await;

    let response = app
        .put_json(
            &format!("/api/v1/topics/{}/notes", topic_id),
            serde_json::json!({
                "content": "Updated content",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["content"], "Updated content");
}

#[tokio::test]
async fn publish_and_unpublish_roundtrip() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "Teacher Notes",
        "Teacher Chapter",
        "Publish Roundtrip",
    )
    .await;

    create_test_teacher_note(app.db.as_ref(), topic_id, "Roundtrip content", "draft").await;

    // Publish
    let pub_resp = app
        .post_json(
            &format!("/api/v1/topics/{}/notes/publish", topic_id),
            serde_json::json!({}),
        )
        .await;
    assert_eq!(pub_resp.status(), StatusCode::OK);
    let pub_body = to_bytes(pub_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let pub_json: serde_json::Value = serde_json::from_slice(&pub_body).expect("parse JSON");
    assert_eq!(pub_json["status"], "published");

    // Unpublish
    let unpub_resp = app
        .post_json(
            &format!("/api/v1/topics/{}/notes/unpublish", topic_id),
            serde_json::json!({}),
        )
        .await;
    assert_eq!(unpub_resp.status(), StatusCode::OK);
    let unpub_body = to_bytes(unpub_resp.into_body(), usize::MAX)
        .await
        .expect("read body");
    let unpub_json: serde_json::Value = serde_json::from_slice(&unpub_body).expect("parse JSON");
    assert_eq!(unpub_json["status"], "draft");
}

// ---------------------------------------------------------------------------
// AI notes (3 tests)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn ai_notes_returns_list_when_exist() {
    let app = TestApp::new().await;
    let topic_id =
        create_content_hierarchy(app.db.as_ref(), "AI Notes", "AI Chapter", "List Topic").await;

    create_test_ai_note(
        app.db.as_ref(),
        topic_id,
        "AI Note 1",
        "First AI note",
        "pending_review",
    )
    .await;
    create_test_ai_note(
        app.db.as_ref(),
        topic_id,
        "AI Note 2",
        "Second AI note",
        "pending_review",
    )
    .await;

    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/ai-notes", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    let notes = json.as_array().expect("expected array");
    assert_eq!(notes.len(), 2);
}

#[tokio::test]
async fn ai_notes_returns_empty_when_none() {
    let app = TestApp::new().await;
    let topic_id =
        create_content_hierarchy(app.db.as_ref(), "AI Notes", "AI Chapter", "Empty AI Topic").await;

    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/ai-notes", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    let notes = json.as_array().expect("expected array");
    assert!(notes.is_empty());
}

#[tokio::test]
async fn approve_ai_note_changes_status() {
    let app = TestApp::new().await;
    let topic_id =
        create_content_hierarchy(app.db.as_ref(), "AI Notes", "AI Chapter", "Approve Topic").await;

    let note = create_test_ai_note(
        app.db.as_ref(),
        topic_id,
        "AI To Approve",
        "Pending AI content",
        "pending_review",
    )
    .await;

    let response = app
        .post_json(
            &format!("/api/v1/topics/{}/ai-notes/{}/approve", topic_id, note.id),
            serde_json::json!({}),
        )
        .await;

    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["status"], "approved");
    assert_eq!(json["id"], note.id.to_string());
}

// ---------------------------------------------------------------------------
// References CRUD (6 tests)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn references_returns_list() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "References",
        "Ref Chapter",
        "List Ref Topic",
    )
    .await;

    create_test_reference(
        app.db.as_ref(),
        topic_id,
        "Ref A",
        "Source A",
        "URL",
        "https://example.com/a",
        true,
    )
    .await;
    create_test_reference(
        app.db.as_ref(),
        topic_id,
        "Ref B",
        "Source B",
        "URL",
        "https://example.com/b",
        false,
    )
    .await;
    create_test_reference(
        app.db.as_ref(),
        topic_id,
        "Ref C",
        "Source C",
        "Video",
        "https://example.com/c",
        true,
    )
    .await;

    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/references", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    let refs = json.as_array().expect("expected array");
    assert_eq!(refs.len(), 3);
}

#[tokio::test]
async fn references_returns_empty_when_none() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "References",
        "Ref Chapter",
        "Empty Ref Topic",
    )
    .await;

    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/references", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
    let refs = json.as_array().expect("expected array");
    assert!(refs.is_empty());
}

#[tokio::test]
async fn create_reference_adds_external_reference() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "References",
        "Ref Chapter",
        "Create Ref Topic",
    )
    .await;

    let response = app
        .post_json(
            &format!("/api/v1/topics/{}/references", topic_id),
            serde_json::json!({
                "title": "My Reference",
                "source": "https://example.com/myref",
                "reference_type": "URL",
                "url": "https://example.com/myref",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::OK);
    let body = to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json: serde_json::Value = serde_json::from_slice(&body).expect("parse JSON");
    assert_eq!(json["title"], "My Reference");
    assert_eq!(json["reference_type"], "URL");
    assert_eq!(json["visible"], true);

    // Verify overview count increments
    let (_, overview) =
        get_json(&app, &format!("/api/v1/topics/{}/notes/overview", topic_id)).await;
    assert_eq!(overview["external_references_count"], 1);
}

#[tokio::test]
async fn delete_reference_soft_deletes() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "References",
        "Ref Chapter",
        "Delete Ref Topic",
    )
    .await;

    let reference = create_test_reference(
        app.db.as_ref(),
        topic_id,
        "To Delete",
        "Source",
        "URL",
        "https://example.com/delete",
        true,
    )
    .await;

    // Delete
    let del_resp = app
        .delete_request(&format!(
            "/api/v1/topics/{}/references/{}",
            topic_id, reference.id
        ))
        .await;
    assert_eq!(del_resp.status(), StatusCode::OK);

    // GET returns empty
    let (status, json) = get_json(&app, &format!("/api/v1/topics/{}/references", topic_id)).await;
    assert_eq!(status, StatusCode::OK);
    let refs = json.as_array().expect("expected array");
    assert!(refs.is_empty());

    // Overview count is 0
    let (_, overview) =
        get_json(&app, &format!("/api/v1/topics/{}/notes/overview", topic_id)).await;
    assert_eq!(overview["external_references_count"], 0);
}

#[tokio::test]
async fn toggle_visibility_flips_flag() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "References",
        "Ref Chapter",
        "Toggle Ref Topic",
    )
    .await;

    let reference = create_test_reference(
        app.db.as_ref(),
        topic_id,
        "Toggle Me",
        "Source",
        "URL",
        "https://example.com/toggle",
        true,
    )
    .await;

    // Toggle visible -> hidden
    let toggle1 = app
        .post_json(
            &format!(
                "/api/v1/topics/{}/references/{}/toggle",
                topic_id, reference.id
            ),
            serde_json::json!({}),
        )
        .await;
    assert_eq!(toggle1.status(), StatusCode::OK);
    let body1 = to_bytes(toggle1.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json1: serde_json::Value = serde_json::from_slice(&body1).expect("parse JSON");
    assert!(!json1["visible"].as_bool().unwrap());

    // Toggle again: hidden -> visible
    let toggle2 = app
        .post_json(
            &format!(
                "/api/v1/topics/{}/references/{}/toggle",
                topic_id, reference.id
            ),
            serde_json::json!({}),
        )
        .await;
    assert_eq!(toggle2.status(), StatusCode::OK);
    let body2 = to_bytes(toggle2.into_body(), usize::MAX)
        .await
        .expect("read body");
    let json2: serde_json::Value = serde_json::from_slice(&body2).expect("parse JSON");
    assert!(json2["visible"].as_bool().unwrap());
}

#[tokio::test]
async fn delete_nonexistent_reference_returns_404() {
    let app = TestApp::new().await;
    let topic_id = create_content_hierarchy(
        app.db.as_ref(),
        "References",
        "Ref Chapter",
        "Not Found Ref Topic",
    )
    .await;

    let fake_id = Uuid::new_v4();
    let resp = app
        .delete_request(&format!(
            "/api/v1/topics/{}/references/{}",
            topic_id, fake_id
        ))
        .await;

    assert_eq!(resp.status(), StatusCode::NOT_FOUND);
}

// ---------------------------------------------------------------------------
// Auth — content routes do NOT require auth
// ---------------------------------------------------------------------------

#[tokio::test]
async fn overview_works_without_auth() {
    let app = TestApp::new().await;
    let topic_id =
        create_content_hierarchy(app.db.as_ref(), "Auth Test", "Auth Chapter", "Auth Topic").await;

    let (status, _) = get_json(&app, &format!("/api/v1/topics/{}/notes/overview", topic_id)).await;

    assert_eq!(status, StatusCode::OK);
}

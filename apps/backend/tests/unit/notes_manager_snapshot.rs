use backend::http::responses::notes_manager::{
    AiNoteResponse, NotesOverviewResponse, ReferenceResponse, TeacherNoteResponse,
};

#[test]
fn notes_overview_empty() {
    let response = NotesOverviewResponse {
        teacher_notes_status: "draft".to_string(),
        ai_notes_status: "none".to_string(),
        external_references_count: 0,
        student_engagement: 0,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("notes-overview-empty", value);
}

#[test]
fn notes_overview_populated() {
    let response = NotesOverviewResponse {
        teacher_notes_status: "published".to_string(),
        ai_notes_status: "approved".to_string(),
        external_references_count: 5,
        student_engagement: 78,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("notes-overview-populated", value);
}

#[test]
fn teacher_note_draft() {
    let response = TeacherNoteResponse {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890".to_string(),
        content: "<p>Draft teacher notes content</p>".to_string(),
        status: "draft".to_string(),
        updated_at: "2026-06-01T12:00:00Z".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("teacher-note-draft", value);
}

#[test]
fn teacher_note_published() {
    let response = TeacherNoteResponse {
        id: "b2c3d4e5-f6a7-8901-bcde-f12345678901".to_string(),
        content: "<p>Published teacher notes with formatting</p>".to_string(),
        status: "published".to_string(),
        updated_at: "2026-06-02T08:30:00Z".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("teacher-note-published", value);
}

#[test]
fn ai_note_pending() {
    let response = AiNoteResponse {
        id: "c3d4e5f6-a7b8-9012-cdef-123456789012".to_string(),
        title: "AI Generated Notes".to_string(),
        content: "<p>AI-generated summary of quadratic equations</p>".to_string(),
        status: "pending_review".to_string(),
        generated_at: "2026-06-01T06:00:00Z".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("ai-note-pending", value);
}

#[test]
fn ai_note_approved() {
    let response = AiNoteResponse {
        id: "d4e5f6a7-b8c9-0123-defa-234567890123".to_string(),
        title: "AI Generated Notes".to_string(),
        content: "<p>Approved AI notes content</p>".to_string(),
        status: "approved".to_string(),
        generated_at: "2026-06-01T07:00:00Z".to_string(),
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("ai-note-approved", value);
}

#[test]
fn reference_visible() {
    let response = ReferenceResponse {
        id: "e5f6a7b8-c9d0-1234-efab-345678901234".to_string(),
        title: "Khan Academy - Quadratic Equations".to_string(),
        source: "https://khanacademy.org/math/quadratics".to_string(),
        reference_type: "URL".to_string(),
        url: "https://khanacademy.org/math/quadratics".to_string(),
        visible: true,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("reference-visible", value);
}

#[test]
fn reference_hidden() {
    let response = ReferenceResponse {
        id: "f6a7b8c9-d0e1-2345-fabc-456789012345".to_string(),
        title: "Draft Research Paper".to_string(),
        source: "https://example.com/draft-paper".to_string(),
        reference_type: "Research Paper".to_string(),
        url: "https://example.com/draft-paper".to_string(),
        visible: false,
    };
    let value = serde_json::to_value(response).expect("serialize");
    insta::assert_json_snapshot!("reference-hidden", value);
}

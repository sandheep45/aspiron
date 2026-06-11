use backend::entries::entities::assessment_question;
use backend::http::handlers::practice_tests::{
    derive_difficulty, derive_question_status, derive_question_type,
};
use uuid::Uuid;

fn dummy_question() -> assessment_question::Model {
    assessment_question::Model {
        id: Uuid::new_v4(),
        question: String::new(),
        correct_answer: String::new(),
        options: serde_json::Value::Null,
        quiz_id: Uuid::new_v4(),
    }
}

// ---------------------------------------------------------------------------
// derive_question_type
// ---------------------------------------------------------------------------

#[test]
fn derive_question_type_returns_mcq_for_array_of_four_short_strings() {
    let options = serde_json::json!(["A", "B", "C", "D"]);
    assert_eq!(derive_question_type(&options), "MCQ");
}

#[test]
fn derive_question_type_returns_mcq_with_single_letter_options() {
    let options = serde_json::json!(["a", "b", "c", "d"]);
    assert_eq!(derive_question_type(&options), "MCQ");
}

#[test]
fn derive_question_type_returns_multiple_select_for_five_or_more_options() {
    let options = serde_json::json!(["A", "B", "C", "D", "E"]);
    assert_eq!(derive_question_type(&options), "Multiple Select");
}

#[test]
fn derive_question_type_returns_subjective_when_any_string_exceeds_fifty_chars() {
    let options = serde_json::json!([
        "short",
        "this is a long string that exceeds fifty characters threshold for subjective detection"
    ]);
    assert_eq!(derive_question_type(&options), "Subjective");
}

#[test]
fn derive_question_type_returns_assertion_reason_for_two_booleans() {
    let options = serde_json::json!(["true", "false"]);
    assert_eq!(derive_question_type(&options), "Assertion Reason");
}

#[test]
fn derive_question_type_case_sensitive_booleans_fall_to_mcq() {
    let options = serde_json::json!(["True", "False"]);
    assert_eq!(derive_question_type(&options), "MCQ");
}

#[test]
fn derive_question_type_returns_numerical_for_non_array_value() {
    let options = serde_json::json!({"value": 42, "tolerance": 0.5});
    assert_eq!(derive_question_type(&options), "Numerical");
}

#[test]
fn derive_question_type_returns_numerical_for_null() {
    assert_eq!(derive_question_type(&serde_json::Value::Null), "Numerical");
}

#[test]
fn derive_question_type_returns_numerical_for_primitive() {
    let options = serde_json::json!(42);
    assert_eq!(derive_question_type(&options), "Numerical");
}

// ---------------------------------------------------------------------------
// derive_difficulty
// ---------------------------------------------------------------------------

#[test]
fn derive_difficulty_index_zero_returns_easy() {
    let q = dummy_question();
    assert_eq!(derive_difficulty(&q, 0), "Easy");
}

#[test]
fn derive_difficulty_index_one_returns_medium() {
    let q = dummy_question();
    assert_eq!(derive_difficulty(&q, 1), "Medium");
}

#[test]
fn derive_difficulty_index_two_returns_hard() {
    let q = dummy_question();
    assert_eq!(derive_difficulty(&q, 2), "Hard");
}

#[test]
fn derive_difficulty_cycles_after_three() {
    let q = dummy_question();
    assert_eq!(derive_difficulty(&q, 3), "Easy");
    assert_eq!(derive_difficulty(&q, 4), "Medium");
    assert_eq!(derive_difficulty(&q, 5), "Hard");
}

#[test]
fn derive_difficulty_handles_mod_three_for_large_indices() {
    let q = dummy_question();
    assert_eq!(derive_difficulty(&q, 99), "Easy");
    assert_eq!(derive_difficulty(&q, 100), "Medium");
    assert_eq!(derive_difficulty(&q, 101), "Hard");
    assert_eq!(derive_difficulty(&q, 999), "Easy");
    assert_eq!(derive_difficulty(&q, 1000), "Medium");
}

// ---------------------------------------------------------------------------
// derive_question_status
// ---------------------------------------------------------------------------

#[test]
fn derive_question_status_always_returns_active() {
    let q = dummy_question();
    assert_eq!(derive_question_status(&q), "Active");
}

#[test]
fn derive_question_status_ignores_question_content() {
    let mut q = dummy_question();
    q.question = "any content".to_string();
    assert_eq!(derive_question_status(&q), "Active");
}

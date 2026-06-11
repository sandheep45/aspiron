use backend::http::responses::practice_tests::{CreateQuestionResponse, CreateTestResponse};
use uuid::Uuid;

fn strip_id(mut value: serde_json::Value) -> serde_json::Value {
    value.as_object_mut().and_then(|m| m.remove("id"));
    value
}

// ---------------------------------------------------------------------------
// CreateQuestionRequest — manually constructed JSON since payload only derives Deserialize
// ---------------------------------------------------------------------------

#[test]
fn create_question_request_mcq() {
    let value = serde_json::json!({
        "question": "What is the derivative of x²?",
        "question_type": "MCQ",
        "difficulty": "Medium",
        "correct_answer": "2x",
        "explanation": "The power rule states that d/dx(x^n) = nx^(n-1)",
        "common_mistakes": "Students often forget to multiply by the exponent",
        "hints": "Remember the power rule",
        "learning_objective": "Understand differentiation",
        "estimated_time": 2,
        "status": "Active",
        "tags": ["calculus", "derivatives"],
        "choices": ["x", "2x", "x²", "2"]
    });
    insta::assert_json_snapshot!("create-question-request-mcq", value);
}

#[test]
fn create_question_request_numerical() {
    let value = serde_json::json!({
        "question": "Calculate the area of a circle with radius 5",
        "question_type": "Numerical",
        "difficulty": "Hard",
        "correct_answer": "78.54",
        "status": "Draft",
        "tolerance": "0.5",
        "unit": "cm²"
    });
    insta::assert_json_snapshot!("create-question-request-numerical", value);
}

#[test]
fn create_question_request_subjective() {
    let value = serde_json::json!({
        "question": "Explain the process of photosynthesis",
        "question_type": "Subjective",
        "difficulty": "Easy",
        "correct_answer": "Photosynthesis converts light energy to chemical energy",
        "rubric": "Full credit for mentioning light, water, CO2, and glucose",
        "evaluation_criteria": "Key terms must be present"
    });
    insta::assert_json_snapshot!("create-question-request-subjective", value);
}

#[test]
fn create_question_request_assertion_reason() {
    let value = serde_json::json!({
        "question": "Assertion-Reason question",
        "question_type": "Assertion Reason",
        "difficulty": "Hard",
        "correct_answer": "Both A and R are true, and R is the correct explanation of A",
        "assertion_reason_assertion": "All prime numbers are odd",
        "assertion_reason_reason": "2 is the only even prime number"
    });
    insta::assert_json_snapshot!("create-question-request-assertion-reason", value);
}

// ---------------------------------------------------------------------------
// CreateTestRequest
// ---------------------------------------------------------------------------

#[test]
fn create_test_request() {
    let value = serde_json::json!({
        "title": "Quadratic Equations Assessment",
        "description": "Test covering quadratic equations and factoring",
        "instructions": "Answer all questions. Show your work.",
        "duration_minutes": 30,
        "passing_score": 40.0,
        "max_attempts": 3,
        "visibility": "Visible",
        "status": "Published",
        "question_ids": [
            "550e8400-e29b-41d4-a716-446655440001",
            "550e8400-e29b-41d4-a716-446655440002",
            "550e8400-e29b-41d4-a716-446655440003"
        ]
    });
    insta::assert_json_snapshot!("create-test-request", value);
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

#[test]
fn create_question_response() {
    let resp = CreateQuestionResponse {
        id: Uuid::new_v4(),
        identifier: "Q-0042".to_string(),
    };
    let value = serde_json::to_value(resp).expect("serialize");
    let value = strip_id(value);
    insta::assert_json_snapshot!("create-question-response", value);
}

#[test]
fn create_test_response() {
    let resp = CreateTestResponse {
        id: Uuid::new_v4(),
        title: "Algebra Test".to_string(),
        questions_count: 5i64,
    };
    let value = serde_json::to_value(resp).expect("serialize");
    let value = strip_id(value);
    insta::assert_json_snapshot!("create-test-response", value);
}

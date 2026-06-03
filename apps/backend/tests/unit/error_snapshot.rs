use backend::setup::error::{ErrorDetails, ErrorResponse};

fn error_json(error: ErrorResponse) -> serde_json::Value {
    let mut value = serde_json::to_value(error).expect("serialize error response");
    // request_id varies per invocation — remove it for deterministic snapshots
    value.as_object_mut().and_then(|m| m.remove("request_id"));
    value
}

#[test]
fn validation_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "VALIDATION".into(),
            message: "email is required".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("validation-error", error_json(err));
}

#[test]
fn auth_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "AUTH".into(),
            message: "invalid credentials".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("auth-error", error_json(err));
}

#[test]
fn access_token_expired_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "ACCESS_TOKEN_EXPIRED".into(),
            message: "token has expired".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("access-token-expired-error", error_json(err));
}

#[test]
fn not_found_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "NOT_FOUND".into(),
            message: "user not found".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("not-found-error", error_json(err));
}

#[test]
fn internal_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "INTERNAL".into(),
            message: "something went wrong".into(),
            details: Some(serde_json::json!({ "detail": "db connection failed" })),
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("internal-error", error_json(err));
}

#[test]
fn unauthorized_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "UNAUTHORIZED".into(),
            message: "Missing VIEW_ANALYTICS permission".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("unauthorized-error", error_json(err));
}

#[test]
fn not_found_topic_error() {
    let err = ErrorResponse {
        error: ErrorDetails {
            code: "NOT_FOUND".into(),
            message: "Topic not found".into(),
            details: None,
        },
        request_id: None,
    };
    insta::assert_json_snapshot!("not-found-topic-error", error_json(err));
}

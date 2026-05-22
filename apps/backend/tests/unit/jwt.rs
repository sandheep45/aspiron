use backend::utils::jwt::{
    Claims, JwtError, decode_jwt, encode_access_token, encode_refresh_token,
};
use jsonwebtoken::{EncodingKey, Header, encode};

const TEST_SECRET: &str = "test-secret-key-for-unit-tests-32chars!!";
const USER_ID: &str = "550e8400-e29b-41d4-a716-446655440000";

#[test]
fn encode_and_decode_access_token_roundtrip() {
    let token = encode_access_token(USER_ID, TEST_SECRET, 3600).unwrap();
    let claims = decode_jwt(&token, TEST_SECRET).unwrap();
    assert_eq!(claims.sub, USER_ID);
}

#[test]
fn encode_and_decode_refresh_token_roundtrip() {
    let token = encode_refresh_token(USER_ID, TEST_SECRET, 86400).unwrap();
    let claims = decode_jwt(&token, TEST_SECRET).unwrap();
    assert_eq!(claims.sub, USER_ID);
}

#[test]
fn access_and_refresh_tokens_are_different() {
    let access = encode_access_token(USER_ID, TEST_SECRET, 3600).unwrap();
    let refresh = encode_refresh_token(USER_ID, TEST_SECRET, 86400).unwrap();
    assert_ne!(access, refresh);
}

#[test]
fn tokens_with_different_user_ids_have_different_claims() {
    let token_a = encode_access_token("user-a", TEST_SECRET, 3600).unwrap();
    let token_b = encode_access_token("user-b", TEST_SECRET, 3600).unwrap();
    let claims_a = decode_jwt(&token_a, TEST_SECRET).unwrap();
    let claims_b = decode_jwt(&token_b, TEST_SECRET).unwrap();
    assert_eq!(claims_a.sub, "user-a");
    assert_eq!(claims_b.sub, "user-b");
}

#[test]
fn decode_returns_invalid_error_for_garbage_token() {
    let result = decode_jwt("not.a.token", TEST_SECRET);
    assert!(matches!(result, Err(JwtError::Invalid(_))));
}

#[test]
fn decode_returns_invalid_error_for_empty_string() {
    let result = decode_jwt("", TEST_SECRET);
    assert!(matches!(result, Err(JwtError::Invalid(_))));
}

#[test]
fn decode_returns_invalid_error_for_wrong_secret() {
    let token = encode_access_token(USER_ID, TEST_SECRET, 3600).unwrap();
    let result = decode_jwt(&token, "wrong-secret-that-is-also-32-chars-long!!");
    assert!(matches!(result, Err(JwtError::Invalid(_))));
}

#[test]
fn decode_returns_expired_error_for_expired_token() {
    let claims = Claims {
        sub: USER_ID.to_string(),
        exp: 0,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(TEST_SECRET.as_bytes()),
    )
    .unwrap();
    let result = decode_jwt(&token, TEST_SECRET);
    assert!(matches!(result, Err(JwtError::Expired(_))));
}

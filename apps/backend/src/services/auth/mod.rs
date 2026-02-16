use axum::Json as ResponseJson;
use axum::extract::Json;

use crate::entries::payload::LoginRequest;

pub async fn authenticate_user(Json(login_payload): Json<LoginRequest>) -> ResponseJson<bool> {
    println!("{}", login_payload.email);
    ResponseJson(true)
}

pub async fn get_me() -> ResponseJson<bool> {
    ResponseJson(true)
}

pub async fn refresh_token() -> ResponseJson<bool> {
    ResponseJson(true)
}

pub async fn register_user() -> ResponseJson<bool> {
    ResponseJson(true)
}

pub async fn log_out() -> ResponseJson<bool> {
    ResponseJson(true)
}

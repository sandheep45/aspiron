pub mod helpers;

use axum::Json as ResponseJson;
use axum::extract::Json;
use axum::extract::State;
use axum::http::HeaderMap;
use axum::http::header::SET_COOKIE;
use axum::response::IntoResponse;
use cookie::time::Duration;

use crate::constants::AllowedClientType;
use crate::entries::payload::LoginRequest;
use crate::services::auth::helpers::{
    build_auth_response, build_token_cookie, generate_tokens, validate_credentials,
};
use crate::setup::app::AppState;
use crate::setup::error::AppError;

#[axum::debug_handler]
pub async fn authenticate_user(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(login_payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_type = headers
        .get("x-client-type")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.parse::<AllowedClientType>().ok());

    let db = state.db.as_ref();

    let user = validate_credentials(db, &login_payload.email, &login_payload.password).await?;

    let jwt_secret = &state.config.jwt.secret;
    let (access_token, refresh_token) = generate_tokens(&user.id.to_string(), jwt_secret)?;

    let auth_response = build_auth_response(access_token.clone(), refresh_token.clone(), user);

    match client_type {
        Some(AllowedClientType::BROWSER) => {
            let cookie_name = state.config.jwt.cookie_name.clone();
            let is_development = state.config.app.env == "development";

            let access_cookie =
                build_token_cookie(cookie_name.clone(), access_token, Duration::hours(1), is_development);
            let refresh_cookie = build_token_cookie(
                format!("{}_refresh", cookie_name),
                refresh_token,
                Duration::days(7),
                is_development,
            );

            let mut response = ResponseJson(auth_response).into_response();
            response
                .headers_mut()
                .append(SET_COOKIE, access_cookie.to_string().parse().unwrap());
            response
                .headers_mut()
                .append(SET_COOKIE, refresh_cookie.to_string().parse().unwrap());

            Ok(response)
        }
        Some(AllowedClientType::MOBILE) | None => Ok(ResponseJson(auth_response).into_response()),
    }
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

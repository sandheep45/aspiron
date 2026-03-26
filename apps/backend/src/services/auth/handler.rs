use axum::Extension;
use axum::Json as ResponseJson;
use axum::extract::Json;
use axum::extract::State;
use axum::http::HeaderMap;
use axum::http::header::SET_COOKIE;
use axum::response::IntoResponse;
use cookie::time::Duration;

use crate::constants::AllowedClientType;
use crate::entries::dtos::payload::auth::LoginRequest;
use crate::middleware::auth::AuthUser;
use crate::services::auth::state::AuthState;
use crate::services::auth::utils::build_token_cookie;
use crate::setup::app::AppState;
use crate::setup::error::AppError;
use crate::utils::jwt::decode_jwt;

#[axum::debug_handler]
#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    tag = "Auth",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "User authenticated successfully")
    )
)]
pub async fn authenticate_user(
    Extension(auth_state): Extension<AuthState>,
    State(_state): State<AppState>,
    headers: HeaderMap,
    Json(login_payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_type = headers
        .get("x-client-type")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.parse::<AllowedClientType>().ok());

    let (auth_response, cookies) = auth_state
        .login_with_cookies(&login_payload.email, &login_payload.password, client_type)
        .await?;

    match cookies {
        Some(cookies) => {
            let access_cookie = build_token_cookie(
                cookies.cookie_name.clone(),
                cookies.access_token,
                Duration::seconds(auth_state.access_token_expiry as i64),
                cookies.is_development,
            );
            let refresh_cookie = build_token_cookie(
                format!("{}_refresh", cookies.cookie_name),
                cookies.refresh_token,
                Duration::seconds(auth_state.refresh_token_expiry as i64),
                cookies.is_development,
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
        None => Ok(ResponseJson(auth_response).into_response()),
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/me",
    tag = "Auth",
    responses(
        (status = 200, description = "Get current user")
    )
)]
pub async fn get_me(
    Extension(auth_user): Extension<AuthUser>,
    Extension(auth_state): Extension<AuthState>,
) -> Result<ResponseJson<crate::entries::dtos::response::auth::AuthResponse>, AppError> {
    let response = auth_state
        .auth_service
        .get_current_user(auth_user.0)
        .await?;
    Ok(ResponseJson(response))
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/refresh-token",
    tag = "Auth",
    responses(
        (status = 200, description = "Refresh access token")
    )
)]
pub async fn refresh_token(
    Extension(auth_state): Extension<AuthState>,
    State(_state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    let refresh_token = headers
        .get("cookie")
        .and_then(|v| v.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .find(|c| c.trim().starts_with(&auth_state.refresh_cookie_name))
        })
        .and_then(|c| c.split('=').nth(1))
        .map(|s| s.to_string())
        .ok_or_else(|| AppError::auth("Refresh token not found"))?;

    let claims = decode_jwt(&refresh_token, &auth_state.jwt_secret).map_err(|err| match err {
        crate::utils::jwt::JwtError::Expired(_) => {
            AppError::refresh_token_expired("Refresh token has expired")
        }
        crate::utils::jwt::JwtError::Invalid(_) => AppError::auth("Invalid refresh token"),
    })?;

    let auth_response = auth_state
        .auth_service
        .generate_new_access_token(
            &claims.sub,
            &auth_state.jwt_secret,
            auth_state.access_token_expiry,
            auth_state.refresh_token_expiry,
        )
        .await?;

    let access_cookie = build_token_cookie(
        auth_state.cookie_name.clone(),
        auth_response.access_token.clone(),
        Duration::seconds(auth_state.access_token_expiry as i64),
        auth_state.is_development,
    );
    let refresh_cookie = build_token_cookie(
        auth_state.refresh_cookie_name.clone(),
        auth_response.refresh_token.clone(),
        Duration::seconds(auth_state.refresh_token_expiry as i64),
        auth_state.is_development,
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

#[utoipa::path(
    post,
    path = "/api/v1/auth/register-user",
    tag = "Auth",
    responses(
        (status = 200, description = "Register a new user")
    )
)]
pub async fn register_user() -> ResponseJson<bool> {
    ResponseJson(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/logout",
    tag = "Auth",
    responses(
        (status = 200, description = "User logged out")
    )
)]
pub async fn log_out() -> ResponseJson<bool> {
    ResponseJson(true)
}

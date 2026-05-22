use axum::Extension;
use axum::Json;
use axum::extract::State;
use axum::http::HeaderMap;
use axum::http::header::SET_COOKIE;
use axum::response::IntoResponse;
use cookie::time::Duration;

use crate::application::auth::AuthApplicationState;
use crate::application::auth::get_current_user;
use crate::application::auth::login;
use crate::application::auth::refresh_token;
use crate::constants::AllowedClientType;
use crate::entries::dtos::response::common::ApiResponse;
use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::entries::entity_enums::user_types::UserTypeEnums;
use crate::http::payloads::auth::LoginRequest;
use crate::http::responses::auth::{
    AuthPermissionResponse, AuthResponse, AuthRoleResponse, AuthUserResponse, MobileTokenResponse,
};
use crate::middleware::auth::AuthUser;
use crate::setup::app::AppState;
use crate::setup::error::AppError;

fn build_token_cookie(
    name: String,
    value: String,
    max_age: Duration,
    _is_development: bool,
) -> cookie::Cookie<'static> {
    cookie::Cookie::build((name, value))
        .http_only(true)
        .path("/")
        .max_age(max_age)
        .build()
}

fn parse_user_type(s: &str) -> UserTypeEnums {
    match s {
        "STUDENT" => UserTypeEnums::STUDENT,
        "TEACHER" => UserTypeEnums::TEACHER,
        "ADMIN" => UserTypeEnums::ADMIN,
        _ => UserTypeEnums::STUDENT,
    }
}

fn parse_resource_type(s: &str) -> ResourceTypeEnum {
    match s {
        "USER" => ResourceTypeEnum::USER,
        "CONTENT" => ResourceTypeEnum::CONTENT,
        "ASSESSMENT" => ResourceTypeEnum::ASSESSMENT,
        "COMMUNITY" => ResourceTypeEnum::COMMUNITY,
        "SYSTEM" => ResourceTypeEnum::SYSTEM,
        "SUBJECT" => ResourceTypeEnum::SUBJECT,
        "CHAPTER" => ResourceTypeEnum::CHAPTER,
        "TOPIC" => ResourceTypeEnum::TOPIC,
        "VIDEO" => ResourceTypeEnum::VIDEO,
        "QUIZ" => ResourceTypeEnum::QUIZ,
        "QUESTION" => ResourceTypeEnum::QUESTION,
        "THREAD" => ResourceTypeEnum::THREAD,
        "POST" => ResourceTypeEnum::POST,
        "NOTE" => ResourceTypeEnum::NOTE,
        _ => ResourceTypeEnum::USER,
    }
}

fn parse_action_type(s: &str) -> ActionTypeEnum {
    match s {
        "CREATE" => ActionTypeEnum::CREATE,
        "READ" => ActionTypeEnum::READ,
        "UPDATE" => ActionTypeEnum::UPDATE,
        "DELETE" => ActionTypeEnum::DELETE,
        "MANAGE" => ActionTypeEnum::MANAGE,
        "PUBLISH" => ActionTypeEnum::PUBLISH,
        "MODERATE" => ActionTypeEnum::MODERATE,
        "GRADE" => ActionTypeEnum::GRADE,
        "TAKE" => ActionTypeEnum::TAKE,
        "VIEW_RESULTS" => ActionTypeEnum::VIEW_RESULTS,
        "VIEW_ANY_RESULTS" => ActionTypeEnum::VIEW_ANY_RESULTS,
        "ASSIGN_ROLES" => ActionTypeEnum::ASSIGN_ROLES,
        "VIEW_ANALYTICS" => ActionTypeEnum::VIEW_ANALYTICS,
        "MANAGE_SETTINGS" => ActionTypeEnum::MANAGE_SETTINGS,
        "AUDIT" => ActionTypeEnum::AUDIT,
        _ => ActionTypeEnum::READ,
    }
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    tag = "Auth",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "User authenticated successfully", body = ApiResponse<MobileTokenResponse>)
    )
)]
pub async fn authenticate_user(
    Extension(auth_state): Extension<AuthApplicationState>,
    State(_state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_type = headers
        .get("x-client-type")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.parse::<AllowedClientType>().ok());

    let result = login::execute_login(
        &*auth_state.user_repo,
        &*auth_state.password_service,
        &*auth_state.token_service,
        &payload.email,
        &payload.password,
    )
    .await?;

    let mobile_tokens = MobileTokenResponse {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: "Bearer".to_string(),
        expires_in: result.access_expiry as i64,
    };

    match client_type {
        Some(AllowedClientType::MOBILE) => {
            let api_response =
                ApiResponse::success_with_message(mobile_tokens, "Authentication successful");
            Ok(Json(api_response).into_response())
        }
        _ => {
            let api_response = ApiResponse::<()>::empty();
            let mut response = Json(api_response).into_response();

            let access_cookie = build_token_cookie(
                auth_state.cookie_name.clone(),
                mobile_tokens.access_token.clone(),
                Duration::seconds(auth_state.access_token_expiry as i64),
                auth_state.is_development,
            );
            let refresh_cookie = build_token_cookie(
                format!("{}_refresh", auth_state.cookie_name),
                mobile_tokens.refresh_token.clone(),
                Duration::seconds(auth_state.refresh_token_expiry as i64),
                auth_state.is_development,
            );

            response
                .headers_mut()
                .append(SET_COOKIE, access_cookie.to_string().parse().unwrap());
            response
                .headers_mut()
                .append(SET_COOKIE, refresh_cookie.to_string().parse().unwrap());

            Ok(response)
        }
    }
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/me",
    tag = "Auth",
    responses(
        (status = 200, description = "Get current user", body = ApiResponse<AuthResponse>)
    )
)]
pub async fn get_me(
    Extension(auth_user): Extension<AuthUser>,
    Extension(auth_state): Extension<AuthApplicationState>,
) -> Result<Json<ApiResponse<AuthResponse>>, AppError> {
    let current_user =
        get_current_user::execute_get_current_user(&*auth_state.user_repo, auth_user.0).await?;

    let response = AuthResponse {
        user: AuthUserResponse {
            id: current_user.id.0,
            email: current_user.email,
            first_name: current_user.first_name,
            last_name: current_user.last_name,
            avatar_url: current_user.avatar_url,
            is_active: current_user.is_active,
            created_at: chrono::Utc::now().into(),
            updated_at: chrono::Utc::now().into(),
        },
        roles: current_user
            .roles
            .into_iter()
            .map(|r| AuthRoleResponse {
                name: parse_user_type(&r.name),
                display_name: r.display_name,
                description: r.description,
                is_system_role: r.is_system_role,
            })
            .collect(),
        permissions: current_user
            .permissions
            .into_iter()
            .map(|p| AuthPermissionResponse {
                name: p.name,
                resource_type: parse_resource_type(&p.resource_type),
                action: parse_action_type(&p.action),
                description: p.description,
            })
            .collect(),
    };

    let api_response =
        ApiResponse::success_with_message(response, "User profile retrieved successfully");
    Ok(Json(api_response))
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/refresh-token",
    tag = "Auth",
    responses(
        (status = 200, description = "Refresh access token", body = ApiResponse<MobileTokenResponse>)
    )
)]
pub async fn refresh_token_handler(
    Extension(auth_state): Extension<AuthApplicationState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    let refresh_cookie_name = format!("{}_refresh", auth_state.cookie_name);

    let refresh_token_value = headers
        .get("cookie")
        .and_then(|v| v.to_str().ok())
        .and_then(|cookies| {
            cookies
                .split(';')
                .find(|c| c.trim().starts_with(&refresh_cookie_name))
        })
        .and_then(|c| c.split('=').nth(1))
        .map(|s| s.to_string())
        .ok_or_else(|| AppError::auth("Refresh token not found"))?;

    let (new_access, new_refresh, _user_id) = refresh_token::execute_refresh_token(
        &*auth_state.user_repo,
        &*auth_state.token_service,
        &refresh_token_value,
    )
    .await?;

    let mobile_tokens = MobileTokenResponse {
        access_token: new_access.clone(),
        refresh_token: new_refresh.clone(),
        token_type: "Bearer".to_string(),
        expires_in: auth_state.access_token_expiry as i64,
    };

    let api_response =
        ApiResponse::success_with_message(mobile_tokens, "Token refreshed successfully");
    let mut response = Json(api_response).into_response();

    let access_cookie = build_token_cookie(
        auth_state.cookie_name.clone(),
        new_access,
        Duration::seconds(auth_state.access_token_expiry as i64),
        auth_state.is_development,
    );
    let refresh_cookie = build_token_cookie(
        format!("{}_refresh", auth_state.cookie_name),
        new_refresh,
        Duration::seconds(auth_state.refresh_token_expiry as i64),
        auth_state.is_development,
    );

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
pub async fn register_user() -> Json<bool> {
    Json(true)
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/logout",
    tag = "Auth",
    responses(
        (status = 200, description = "User logged out")
    )
)]
pub async fn log_out() -> Json<bool> {
    Json(true)
}

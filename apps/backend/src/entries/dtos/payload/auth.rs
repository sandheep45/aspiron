use crate::entries::entitiy_enums::user_types::UserTypeEnums;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "LoginRequest")]
pub struct LoginRequest {
    #[schema(example = "user@example.com")]
    pub email: String,
    #[schema(example = "password123")]
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RegisterUserRequest")]
pub struct RegisterUserRequest {
    pub email: String,
    pub password: String,
    pub user_type: UserTypeEnums,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "RefreshTokenRequest")]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

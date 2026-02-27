use crate::entries::entitiy_enums::user_types::UserTypeEnums;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use utoipa::ToSchema;

#[derive(Debug, Clone, Serialize, Deserialize, TS, ToSchema)]
#[ts(export, rename = "LoginRequest")]
pub struct LoginRequest {
    #[schema(example = "barbara_turner.1@admin.aspiron")]
    pub email: String,
    #[schema(example = "admin123")]
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

use crate::entries::entitiy_enums::user_types::UserTypeEnums;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "LoginRequest")]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RegisterUserRequest")]
pub struct RegisterUserRequest {
    pub email: String,
    pub password: String,
    pub user_type: UserTypeEnums,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, rename = "RefreshTokenRequest")]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}

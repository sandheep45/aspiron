use serde::Deserialize;
use utoipa::IntoParams;

#[derive(Debug, Deserialize, IntoParams)]
pub struct LiveClassQueryParams {
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

pub struct JoinClassRequest;

use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(
    Debug,
    Copy,
    Clone,
    Serialize,
    DeriveActiveEnum,
    DeriveIden,
    PartialEq,
    Eq,
    EnumIter,
    Hash,
    Deserialize,
    TS,
)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "user_type")]
#[ts(export, rename = "UserTypeEnums")]
pub enum UserTypeEnums {
    #[sea_orm(string_value = "STUDENT")]
    #[ts(rename = "STUDENT")]
    STUDENT,
    #[sea_orm(string_value = "TEACHER")]
    #[ts(rename = "TEACHER")]
    TEACHER,
    #[sea_orm(string_value = "ADMIN")]
    #[ts(rename = "ADMIN")]
    ADMIN,
}

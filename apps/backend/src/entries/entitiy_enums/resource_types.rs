use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(
    Debug,
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
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "resource_type")]
#[ts(export, rename = "ResourceTypeEnum")]
pub enum ResourceTypeEnum {
    #[sea_orm(string_value = "USER")]
    #[ts(rename = "USER")]
    USER,
    #[sea_orm(string_value = "CONTENT")]
    #[ts(rename = "CONTENT")]
    CONTENT,
    #[sea_orm(string_value = "ASSESSMENT")]
    #[ts(rename = "ASSESSMENT")]
    ASSESSMENT,
    #[sea_orm(string_value = "COMMUNITY")]
    #[ts(rename = "COMMUNITY")]
    COMMUNITY,
    #[sea_orm(string_value = "SYSTEM")]
    #[ts(rename = "SYSTEM")]
    SYSTEM,
    #[sea_orm(string_value = "SUBJECT")]
    #[ts(rename = "SUBJECT")]
    SUBJECT,
    #[sea_orm(string_value = "CHAPTER")]
    #[ts(rename = "CHAPTER")]
    CHAPTER,
    #[sea_orm(string_value = "TOPIC")]
    #[ts(rename = "TOPIC")]
    TOPIC,
    #[sea_orm(string_value = "VIDEO")]
    #[ts(rename = "VIDEO")]
    VIDEO,
    #[sea_orm(string_value = "QUIZ")]
    #[ts(rename = "QUIZ")]
    QUIZ,
    #[sea_orm(string_value = "QUESTION")]
    #[ts(rename = "QUESTION")]
    QUESTION,
    #[sea_orm(string_value = "THREAD")]
    #[ts(rename = "THREAD")]
    THREAD,
    #[sea_orm(string_value = "POST")]
    #[ts(rename = "POST")]
    POST,
    #[sea_orm(string_value = "NOTE")]
    #[ts(rename = "NOTE")]
    NOTE,
}

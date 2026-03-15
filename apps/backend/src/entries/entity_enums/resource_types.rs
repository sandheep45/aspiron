use std::fmt;

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

impl fmt::Display for ResourceTypeEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ResourceTypeEnum::USER => write!(f, "USER"),
            ResourceTypeEnum::CONTENT => write!(f, "CONTENT"),
            ResourceTypeEnum::ASSESSMENT => write!(f, "ASSESSMENT"),
            ResourceTypeEnum::COMMUNITY => write!(f, "COMMUNITY"),
            ResourceTypeEnum::SYSTEM => write!(f, "SYSTEM"),
            ResourceTypeEnum::SUBJECT => write!(f, "SUBJECT"),
            ResourceTypeEnum::CHAPTER => write!(f, "CHAPTER"),
            ResourceTypeEnum::TOPIC => write!(f, "TOPIC"),
            ResourceTypeEnum::VIDEO => write!(f, "VIDEO"),
            ResourceTypeEnum::QUIZ => write!(f, "QUIZ"),
            ResourceTypeEnum::QUESTION => write!(f, "QUESTION"),
            ResourceTypeEnum::THREAD => write!(f, "THREAD"),
            ResourceTypeEnum::POST => write!(f, "POST"),
            ResourceTypeEnum::NOTE => write!(f, "NOTE"),
        }
    }
}

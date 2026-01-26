use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::{Deserialize, Serialize};

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
)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "resource_type")]
pub enum ResourceTypeEnum {
    #[sea_orm(string_value = "USER")]
    USER,
    #[sea_orm(string_value = "CONTENT")]
    CONTENT,
    #[sea_orm(string_value = "ASSESSMENT")]
    ASSESSMENT,
    #[sea_orm(string_value = "COMMUNITY")]
    COMMUNITY,
    #[sea_orm(string_value = "SYSTEM")]
    SYSTEM,
    #[sea_orm(string_value = "SUBJECT")]
    SUBJECT,
    #[sea_orm(string_value = "CHAPTER")]
    CHAPTER,
    #[sea_orm(string_value = "TOPIC")]
    TOPIC,
    #[sea_orm(string_value = "VIDEO")]
    VIDEO,
    #[sea_orm(string_value = "QUIZ")]
    QUIZ,
    #[sea_orm(string_value = "QUESTION")]
    QUESTION,
    #[sea_orm(string_value = "THREAD")]
    THREAD,
    #[sea_orm(string_value = "POST")]
    POST,
    #[sea_orm(string_value = "NOTE")]
    NOTE,
}

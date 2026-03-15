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
#[allow(non_camel_case_types)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "action_type")]
#[ts(export, rename = "ActionTypeEnum")]
pub enum ActionTypeEnum {
    #[sea_orm(string_value = "CREATE")]
    #[ts(rename = "CREATE")]
    CREATE,
    #[sea_orm(string_value = "READ")]
    #[ts(rename = "READ")]
    READ,
    #[sea_orm(string_value = "UPDATE")]
    #[ts(rename = "UPDATE")]
    UPDATE,
    #[sea_orm(string_value = "DELETE")]
    #[ts(rename = "DELETE")]
    DELETE,
    #[sea_orm(string_value = "MANAGE")]
    #[ts(rename = "MANAGE")]
    MANAGE,
    #[sea_orm(string_value = "PUBLISH")]
    #[ts(rename = "PUBLISH")]
    PUBLISH,
    #[sea_orm(string_value = "MODERATE")]
    #[ts(rename = "MODERATE")]
    MODERATE,
    #[sea_orm(string_value = "GRADE")]
    #[ts(rename = "GRADE")]
    GRADE,
    #[sea_orm(string_value = "TAKE")]
    #[ts(rename = "TAKE")]
    TAKE,
    #[sea_orm(string_value = "VIEW_RESULTS")]
    #[ts(rename = "VIEW_RESULTS")]
    VIEW_RESULTS,
    #[sea_orm(string_value = "VIEW_ANY_RESULTS")]
    #[ts(rename = "VIEW_ANY_RESULTS")]
    VIEW_ANY_RESULTS,
    #[sea_orm(string_value = "ASSIGN_ROLES")]
    #[ts(rename = "ASSIGN_ROLES")]
    ASSIGN_ROLES,
    #[sea_orm(string_value = "VIEW_ANALYTICS")]
    #[ts(rename = "VIEW_ANALYTICS")]
    VIEW_ANALYTICS,
    #[sea_orm(string_value = "MANAGE_SETTINGS")]
    #[ts(rename = "MANAGE_SETTINGS")]
    MANAGE_SETTINGS,
    #[sea_orm(string_value = "AUDIT")]
    #[ts(rename = "AUDIT")]
    AUDIT,
}

impl fmt::Display for ActionTypeEnum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionTypeEnum::CREATE => write!(f, "CREATE"),
            ActionTypeEnum::READ => write!(f, "READ"),
            ActionTypeEnum::UPDATE => write!(f, "UPDATE"),
            ActionTypeEnum::DELETE => write!(f, "DELETE"),
            ActionTypeEnum::MANAGE => write!(f, "MANAGE"),
            ActionTypeEnum::PUBLISH => write!(f, "PUBLISH"),
            ActionTypeEnum::MODERATE => write!(f, "MODERATE"),
            ActionTypeEnum::GRADE => write!(f, "GRADE"),
            ActionTypeEnum::TAKE => write!(f, "TAKE"),
            ActionTypeEnum::VIEW_RESULTS => write!(f, "VIEW_RESULTS"),
            ActionTypeEnum::VIEW_ANY_RESULTS => write!(f, "VIEW_ANY_RESULTS"),
            ActionTypeEnum::ASSIGN_ROLES => write!(f, "ASSIGN_ROLES"),
            ActionTypeEnum::VIEW_ANALYTICS => write!(f, "VIEW_ANALYTICS"),
            ActionTypeEnum::MANAGE_SETTINGS => write!(f, "MANAGE_SETTINGS"),
            ActionTypeEnum::AUDIT => write!(f, "AUDIT"),
        }
    }
}

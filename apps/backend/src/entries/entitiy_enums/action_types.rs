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
    ViewResults,
    #[sea_orm(string_value = "VIEW_ANY_RESULTS")]
    #[ts(rename = "VIEW_ANY_RESULTS")]
    ViewAnyResults,
    #[sea_orm(string_value = "ASSIGN_ROLES")]
    #[ts(rename = "ASSIGN_ROLES")]
    AssignRoles,
    #[sea_orm(string_value = "VIEW_ANALYTICS")]
    #[ts(rename = "VIEW_ANALYTICS")]
    ViewAnalytics,
    #[sea_orm(string_value = "MANAGE_SETTINGS")]
    #[ts(rename = "MANAGE_SETTINGS")]
    ManageSettings,
    #[sea_orm(string_value = "AUDIT")]
    #[ts(rename = "AUDIT")]
    AUDIT,
}

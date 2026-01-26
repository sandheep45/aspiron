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
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "action_type")]
pub enum ActionTypeEnum {
    #[sea_orm(string_value = "CREATE")]
    CREATE,
    #[sea_orm(string_value = "READ")]
    READ,
    #[sea_orm(string_value = "UPDATE")]
    UPDATE,
    #[sea_orm(string_value = "DELETE")]
    DELETE,
    #[sea_orm(string_value = "MANAGE")]
    MANAGE,
    #[sea_orm(string_value = "PUBLISH")]
    PUBLISH,
    #[sea_orm(string_value = "MODERATE")]
    MODERATE,
    #[sea_orm(string_value = "GRADE")]
    GRADE,
    #[sea_orm(string_value = "TAKE")]
    TAKE,
    #[sea_orm(string_value = "VIEW_RESULTS")]
    ViewResults,
    #[sea_orm(string_value = "ASSIGN_ROLES")]
    AssignRoles,
    #[sea_orm(string_value = "VIEW_ANALYTICS")]
    ViewAnalytics,
    #[sea_orm(string_value = "MANAGE_SETTINGS")]
    ManageSettings,
    #[sea_orm(string_value = "AUDIT")]
    AUDIT,
}

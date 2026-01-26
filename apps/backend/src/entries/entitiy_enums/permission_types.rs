use sea_orm::{DeriveActiveEnum, DeriveIden, EnumIter};
use serde::Serialize;

#[derive(Debug, Clone, Serialize, DeriveActiveEnum, DeriveIden, PartialEq, Eq, EnumIter, Hash)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "permission_type")]
pub enum PermissionTypeEnum {
    #[sea_orm(string_value = "CONTENT_CREATE")]
    ContentCreate,
    #[sea_orm(string_value = "CONTENT_READ")]
    ContentRead,
    #[sea_orm(string_value = "CONTENT_UPDATE")]
    ContentUpdate,
    #[sea_orm(string_value = "CONTENT_DELETE")]
    ContentDelete,
    #[sea_orm(string_value = "CONTENT_PUBLISH")]
    ContentPublish,
    #[sea_orm(string_value = "CONTENT_MODERATE")]
    ContentModerate,
    #[sea_orm(string_value = "USER_CREATE")]
    UserCreate,
    #[sea_orm(string_value = "USER_READ")]
    UserRead,
    #[sea_orm(string_value = "USER_UPDATE")]
    UserUpdate,
    #[sea_orm(string_value = "USER_DELETE")]
    UserDelete,
    #[sea_orm(string_value = "USER_ASSIGN_ROLES")]
    UserAssignRoles,
    #[sea_orm(string_value = "USER_VIEW_ANALYTICS")]
    UserViewAnalytics,
    #[sea_orm(string_value = "ASSESSMENT_CREATE")]
    AssessmentCreate,
    #[sea_orm(string_value = "ASSESSMENT_TAKE")]
    AssessmentTake,
    #[sea_orm(string_value = "ASSESSMENT_GRADE")]
    AssessmentGrade,
    #[sea_orm(string_value = "ASSESSMENT_VIEW_RESULTS")]
    AssessmentViewResults,
    #[sea_orm(string_value = "ASSESSMENT_VIEW_ANY_RESULTS")]
    AssessmentViewAnyResults,
    #[sea_orm(string_value = "SYSTEM_ADMIN")]
    SystemAdmin,
    #[sea_orm(string_value = "SYSTEM_AUDIT")]
    SystemAudit,
    #[sea_orm(string_value = "SYSTEM_VIEW_ANALYTICS")]
    SystemViewAnalytics,
    #[sea_orm(string_value = "SYSTEM_MANAGE_SETTINGS")]
    SystemManageSettings,
}

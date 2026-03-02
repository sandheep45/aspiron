use sea_orm::prelude::{DateTimeWithTimeZone, Json};
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "user_profiles")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub user_id: Uuid,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub avatar_url: Option<String>,
    pub phone: Option<String>,
    pub timezone: Option<String>,
    pub language: Option<String>,
    pub preferences: Option<Json>,
    pub last_login: Option<DateTimeWithTimeZone>,
    pub login_count: Option<i32>,
    pub account_locked_until: Option<DateTimeWithTimeZone>,
    pub failed_login_attempts: Option<i32>,
    pub mfa_enabled: Option<bool>,
    pub mfa_secret_encrypted: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id"
    )]
    User,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

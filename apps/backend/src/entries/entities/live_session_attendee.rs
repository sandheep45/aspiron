use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "live_session_attendees")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub session_id: Uuid,
    pub user_id: Uuid,
    pub joined_at: DateTimeWithTimeZone,
    pub left_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::live_session::Entity",
        from = "Column::SessionId",
        to = "super::live_session::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    LiveSession,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    User,
}

impl Related<super::live_session::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LiveSession.def()
    }
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

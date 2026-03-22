use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use serde_json::Value;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "resource_permissions")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub resource_type: ResourceTypeEnum,
    pub resource_id: Uuid,
    pub user_id: Uuid,
    pub permission: ActionTypeEnum,
    pub granted_by: Option<Uuid>,
    pub granted_at: DateTimeWithTimeZone,
    pub expires_at: Option<DateTimeWithTimeZone>,
    pub conditions: Option<Value>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    User,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::GrantedBy",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    GrantedByUser,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

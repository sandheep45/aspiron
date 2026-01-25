use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "assessment_proctoring_signals")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub attempt_id: Uuid,
    pub signal_type: String,
    pub signal_value: String,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::assessment_attempt::Entity",
        from = "Column::AttemptId",
        to = "super::assessment_attempt::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    AssessmentAttempt,
}

impl Related<super::assessment_attempt::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentAttempt.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

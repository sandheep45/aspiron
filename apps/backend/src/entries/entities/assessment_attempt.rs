use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "assessment_attempts")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub started_at: DateTimeWithTimeZone,
    pub submitted_at: Option<DateTimeWithTimeZone>,
    pub quiz_id: Uuid,
    pub user_id: Uuid,
    pub score: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::assessment_quiz::Entity",
        from = "Column::QuizId",
        to = "super::assessment_quiz::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    AssessmentQuiz,
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    User,
    #[sea_orm(has_many = "super::assessment_proctoring_signal::Entity")]
    AssessmentProctoringSignal,
}

impl Related<super::assessment_quiz::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentQuiz.def()
    }
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl Related<super::assessment_proctoring_signal::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentProctoringSignal.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

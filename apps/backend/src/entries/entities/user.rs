use sea_orm::prelude::DateTimeWithTimeZone;
use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub email: String,
    pub password_hash: String,
    pub is_active: bool,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::learning_progress::Entity")]
    LearningProgress,
    #[sea_orm(has_many = "super::learning_recall_session::Entity")]
    LearningRecallSession,
    #[sea_orm(has_many = "super::assessment_attempt::Entity")]
    AssessmentAttempt,
    #[sea_orm(has_many = "super::community_thread::Entity")]
    CommunityThread,
    #[sea_orm(has_many = "super::community_post::Entity")]
    CommunityPost,
}

impl Related<super::learning_progress::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LearningProgress.def()
    }
}

impl Related<super::learning_recall_session::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LearningRecallSession.def()
    }
}

impl Related<super::assessment_attempt::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentAttempt.def()
    }
}

impl Related<super::community_thread::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CommunityThread.def()
    }
}

impl Related<super::community_post::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CommunityPost.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

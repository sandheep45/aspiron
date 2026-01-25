use sea_orm::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "content_topics")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: Uuid,
    pub name: String,
    pub chapter_id: Uuid,
    pub order_number: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::content_chapter::Entity",
        from = "Column::ChapterId",
        to = "super::content_chapter::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ContentChapter,
    #[sea_orm(has_many = "super::content_video::Entity")]
    ContentVideo,
    #[sea_orm(has_many = "super::learning_notes::Entity")]
    LearningNotes,
    #[sea_orm(has_many = "super::learning_progress::Entity")]
    LearningProgress,
    #[sea_orm(has_many = "super::learning_recall_session::Entity")]
    LearningRecallSession,
    #[sea_orm(has_many = "super::assessment_quiz::Entity")]
    AssessmentQuiz,
    #[sea_orm(has_many = "super::community_thread::Entity")]
    CommunityThread,
}

impl Related<super::content_chapter::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentChapter.def()
    }
}

impl Related<super::content_video::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ContentVideo.def()
    }
}

impl Related<super::learning_notes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::LearningNotes.def()
    }
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

impl Related<super::assessment_quiz::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::AssessmentQuiz.def()
    }
}

impl Related<super::community_thread::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CommunityThread.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

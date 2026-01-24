use ::backend::entries::entitiy_enums::{
    content_owner_types::ContentOwnerTypeEnum, exam_types::ExamTypeEnums,
    learning_recall_question_type::LearningRecallQuestionTypeEnum,
    learning_recall_session_status::LearningRecallSessionStatusEnum,
    notes_content_type::NotesContentTypeEnum, notification_event_type::NotificationEventTypeEnum,
    notification_logs_types::NotificationLogsTypesEnum, trust_level::TrustLevelEnum,
    user_types::UserTypeEnums,
};
use sea_orm::{DbBackend, Schema, sea_query::extension::postgres::Type};
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let schema = Schema::new(DbBackend::Postgres);
        manager
            .create_type(schema.create_enum_from_active_enum::<UserTypeEnums>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<ExamTypeEnums>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<ContentOwnerTypeEnum>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<LearningRecallQuestionTypeEnum>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<LearningRecallSessionStatusEnum>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<NotesContentTypeEnum>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<TrustLevelEnum>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<NotificationLogsTypesEnum>())
            .await?;

        manager
            .create_type(schema.create_enum_from_active_enum::<NotificationEventTypeEnum>())
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_type(Type::drop().name("user_type").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("exam_type").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("content_owner_type").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("trust_level").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("notes_content_type").to_owned())
            .await?;

        manager
            .drop_type(
                Type::drop()
                    .name("learning_recall_question_type")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_type(
                Type::drop()
                    .name("learning_recall_session_status")
                    .to_owned(),
            )
            .await?;

        manager
            .drop_type(Type::drop().name("notification_event_type").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("notification_logs_types").to_owned())
            .await?;

        Ok(())
    }
}

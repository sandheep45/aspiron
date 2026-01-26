use sea_orm_migration::{
    DbErr, MigrationTrait, SchemaManager, async_trait,
    prelude::{ColumnDef, ForeignKey, ForeignKeyAction, Index, Table},
    sea_orm::DeriveMigrationName,
};

use crate::identifiers::{
    assessment_table::{
        AssessmentAttemptsTableIdentifier, AssessmentProctoringSignalTableIdentifier,
        AssessmentQuestionsTableIdentifier, AssessmentQuizzesTableIdentifier,
    },
    content_table::ContentTopicTableIdentifier,
    user_table::UserTableIdentifiers,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // ------------------ QUIZZES ------------------
        manager
            .create_table(
                Table::create()
                    .table(AssessmentQuizzesTableIdentifier::Table)
                    .col(
                        ColumnDef::new(AssessmentQuizzesTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AssessmentQuizzesTableIdentifier::TopicId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentQuizzesTableIdentifier::Title)
                            .text()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_assessment_quizzes_topic")
                            .from(
                                AssessmentQuizzesTableIdentifier::Table,
                                AssessmentQuizzesTableIdentifier::TopicId,
                            )
                            .to(
                                ContentTopicTableIdentifier::Table,
                                ContentTopicTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ QUESTIONS ------------------
        manager
            .create_table(
                Table::create()
                    .table(AssessmentQuestionsTableIdentifier::Table)
                    .col(
                        ColumnDef::new(AssessmentQuestionsTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AssessmentQuestionsTableIdentifier::Question)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentQuestionsTableIdentifier::CorrectAnswer)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentQuestionsTableIdentifier::Options)
                            .json_binary()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentQuestionsTableIdentifier::QuizId)
                            .uuid()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_assessment_questions_quiz")
                            .from(
                                AssessmentQuestionsTableIdentifier::Table,
                                AssessmentQuestionsTableIdentifier::QuizId,
                            )
                            .to(
                                AssessmentQuizzesTableIdentifier::Table,
                                AssessmentQuizzesTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ ATTEMPTS ------------------
        manager
            .create_table(
                Table::create()
                    .table(AssessmentAttemptsTableIdentifier::Table)
                    .col(
                        ColumnDef::new(AssessmentAttemptsTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AssessmentAttemptsTableIdentifier::StartedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentAttemptsTableIdentifier::SubmittedAt)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentAttemptsTableIdentifier::QuizId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentAttemptsTableIdentifier::UserId)
                            .uuid()
                            .not_null(),
                    )
                    .col(ColumnDef::new(AssessmentAttemptsTableIdentifier::Score).integer())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_assessment_attempts_user")
                            .from(
                                AssessmentAttemptsTableIdentifier::Table,
                                AssessmentAttemptsTableIdentifier::UserId,
                            )
                            .to(UserTableIdentifiers::Table, UserTableIdentifiers::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_assessment_attempts_quiz")
                            .from(
                                AssessmentAttemptsTableIdentifier::Table,
                                AssessmentAttemptsTableIdentifier::QuizId,
                            )
                            .to(
                                AssessmentQuizzesTableIdentifier::Table,
                                AssessmentQuizzesTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ PROCTORING SIGNALS ------------------
        manager
            .create_table(
                Table::create()
                    .table(AssessmentProctoringSignalTableIdentifier::Table)
                    .col(
                        ColumnDef::new(AssessmentProctoringSignalTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(AssessmentProctoringSignalTableIdentifier::AttemptId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentProctoringSignalTableIdentifier::SignalType)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentProctoringSignalTableIdentifier::SignalValue)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(AssessmentProctoringSignalTableIdentifier::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_assessment_proctoring_signal_attempt")
                            .from(
                                AssessmentProctoringSignalTableIdentifier::Table,
                                AssessmentProctoringSignalTableIdentifier::AttemptId,
                            )
                            .to(
                                AssessmentAttemptsTableIdentifier::Table,
                                AssessmentAttemptsTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // ------------------ INDEXES ------------------
        manager
            .create_index(
                Index::create()
                    .name("idx_assessment_questions_quiz")
                    .table(AssessmentQuestionsTableIdentifier::Table)
                    .col(AssessmentQuestionsTableIdentifier::QuizId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_assessment_attempts_quiz")
                    .table(AssessmentAttemptsTableIdentifier::Table)
                    .col(AssessmentAttemptsTableIdentifier::QuizId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_assessment_attempts_user")
                    .table(AssessmentAttemptsTableIdentifier::Table)
                    .col(AssessmentAttemptsTableIdentifier::UserId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes
        manager
            .drop_index(
                Index::drop()
                    .name("idx_assessment_questions_quiz")
                    .to_owned(),
            )
            .await?;
        manager
            .drop_index(
                Index::drop()
                    .name("idx_assessment_attempts_quiz")
                    .to_owned(),
            )
            .await?;
        manager
            .drop_index(
                Index::drop()
                    .name("idx_assessment_attempts_user")
                    .to_owned(),
            )
            .await?;

        // Drop tables (child → parent)
        manager
            .drop_table(
                Table::drop()
                    .table(AssessmentProctoringSignalTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(AssessmentAttemptsTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(AssessmentQuestionsTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(AssessmentQuizzesTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

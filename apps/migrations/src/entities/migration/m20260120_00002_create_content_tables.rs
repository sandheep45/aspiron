use sea_orm_migration::prelude::*;

use crate::identifiers::content_table::{
    ContentChapterTableIdentifier, ContentSubjectTableIdentifier, ContentTopicTableIdentifier,
    ContentVideoTableIdentifier,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 1️⃣ Create subjects table
        manager
            .create_table(
                Table::create()
                    .table(ContentSubjectTableIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ContentSubjectTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ContentSubjectTableIdentifier::Name)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentSubjectTableIdentifier::ExamType)
                            .custom("exam_type")
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentSubjectTableIdentifier::CreatedAt)
                            .timestamp_with_time_zone()
                            .default(Expr::cust("CURRENT_TIMESTAMP"))
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentSubjectTableIdentifier::UpdatedAt)
                            .timestamp_with_time_zone()
                            .default(Expr::cust("CURRENT_TIMESTAMP"))
                            .not_null(),
                    )
                    .to_owned(),
            )
            .await?;

        // Unique index for subjects (exam_type + name)
        manager
            .create_index(
                Index::create()
                    .name("ux_content_subject_exam_type_name")
                    .table(ContentSubjectTableIdentifier::Table)
                    .col(ContentSubjectTableIdentifier::ExamType)
                    .col(ContentSubjectTableIdentifier::Name)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // 2️⃣ Create chapters table
        manager
            .create_table(
                Table::create()
                    .table(ContentChapterTableIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ContentChapterTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ContentChapterTableIdentifier::Name)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentChapterTableIdentifier::SubjectId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentChapterTableIdentifier::OrderNumber)
                            .integer()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_chapter_subject")
                            .from(
                                ContentChapterTableIdentifier::Table,
                                ContentChapterTableIdentifier::SubjectId,
                            )
                            .to(
                                ContentSubjectTableIdentifier::Table,
                                ContentSubjectTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Indexes for chapters
        manager
            .create_index(
                Index::create()
                    .name("idx_chapter_subject")
                    .table(ContentChapterTableIdentifier::Table)
                    .col(ContentChapterTableIdentifier::SubjectId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("ux_chapter_subject_order")
                    .table(ContentChapterTableIdentifier::Table)
                    .col(ContentChapterTableIdentifier::SubjectId)
                    .col(ContentChapterTableIdentifier::OrderNumber)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // 3️⃣ Create topics table
        manager
            .create_table(
                Table::create()
                    .table(ContentTopicTableIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ContentTopicTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ContentTopicTableIdentifier::Name)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentTopicTableIdentifier::ChapterId)
                            .uuid()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentTopicTableIdentifier::OrderNumber)
                            .integer()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_topic_chapter")
                            .from(
                                ContentTopicTableIdentifier::Table,
                                ContentTopicTableIdentifier::ChapterId,
                            )
                            .to(
                                ContentChapterTableIdentifier::Table,
                                ContentChapterTableIdentifier::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Indexes for topics
        manager
            .create_index(
                Index::create()
                    .name("idx_topic_chapter")
                    .table(ContentTopicTableIdentifier::Table)
                    .col(ContentTopicTableIdentifier::ChapterId)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("ux_topic_chapter_order")
                    .table(ContentTopicTableIdentifier::Table)
                    .col(ContentTopicTableIdentifier::ChapterId)
                    .col(ContentTopicTableIdentifier::OrderNumber)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // 4️⃣ Create videos table
        manager
            .create_table(
                Table::create()
                    .table(ContentVideoTableIdentifier::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(ContentVideoTableIdentifier::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ContentVideoTableIdentifier::TopicId)
                            .uuid()
                            .not_null(),
                    )
                    .col(ColumnDef::new(ContentVideoTableIdentifier::Transcript).text())
                    .col(
                        ColumnDef::new(ContentVideoTableIdentifier::Title)
                            .text()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentVideoTableIdentifier::DurationSeconds)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(ContentVideoTableIdentifier::VideoUrl)
                            .text()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_video_topic")
                            .from(
                                ContentVideoTableIdentifier::Table,
                                ContentVideoTableIdentifier::TopicId,
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

        // Index for videos
        manager
            .create_index(
                Index::create()
                    .name("idx_video_topic")
                    .table(ContentVideoTableIdentifier::Table)
                    .col(ContentVideoTableIdentifier::TopicId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop indexes first, in reverse order of creation

        // Videos table indexes
        manager
            .drop_index(
                Index::drop()
                    .name("idx_video_topic")
                    .table(ContentVideoTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        // Topics table indexes
        manager
            .drop_index(
                Index::drop()
                    .name("ux_topic_chapter_order")
                    .table(ContentTopicTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_index(
                Index::drop()
                    .name("idx_topic_chapter")
                    .table(ContentTopicTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        // Chapters table indexes
        manager
            .drop_index(
                Index::drop()
                    .name("ux_chapter_subject_order")
                    .table(ContentChapterTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_index(
                Index::drop()
                    .name("idx_chapter_subject")
                    .table(ContentChapterTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        // Subjects table indexes
        manager
            .drop_index(
                Index::drop()
                    .name("ux_content_subject_exam_type_name")
                    .table(ContentSubjectTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        // Drop tables in reverse dependency order
        manager
            .drop_table(
                Table::drop()
                    .table(ContentVideoTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(ContentTopicTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(ContentChapterTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(ContentSubjectTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

use sea_orm_migration::{
    DbErr, MigrationTrait, SchemaManager, async_trait, prelude::Table, sea_orm::DeriveMigrationName,
};

use crate::identifiers::content_table::{
    ContentChapterTableIdentifier, ContentSubjectTableIdentifier, ContentTopicTableIdentifier,
    ContentVideoTableIdentifier,
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(ContentSubjectTableIdentifier::Table)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(ContentChapterTableIdentifier::Table)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(ContentTopicTableIdentifier::Table)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(ContentVideoTableIdentifier::Table)
                    .if_not_exists()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(ContentSubjectTableIdentifier::Table)
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
                    .table(ContentTopicTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        manager
            .drop_table(
                Table::drop()
                    .table(ContentVideoTableIdentifier::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

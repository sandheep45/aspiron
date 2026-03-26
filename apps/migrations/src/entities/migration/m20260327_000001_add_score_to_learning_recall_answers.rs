use sea_orm_migration::{
    DbErr, MigrationTrait, SchemaManager, async_trait,
    prelude::{ColumnDef, Table},
    sea_orm::DeriveMigrationName,
};

use crate::identifiers::learning_table::LearningRecallAnswerTableIdentifier;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(LearningRecallAnswerTableIdentifier::Table)
                    .add_column(
                        ColumnDef::new(LearningRecallAnswerTableIdentifier::Score)
                            .integer()
                            .null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(LearningRecallAnswerTableIdentifier::Table)
                    .drop_column(LearningRecallAnswerTableIdentifier::Score)
                    .to_owned(),
            )
            .await
    }
}

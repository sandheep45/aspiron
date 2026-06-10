use sea_orm::{DbBackend, Schema};
use sea_orm_migration::prelude::*;

use crate::identifiers::learning_table::LearningNotesTableIdentifier;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let schema = Schema::new(DbBackend::Postgres);

        manager
            .create_type(
                schema.create_enum_from_active_enum::<::backend::entries::entity_enums::external_reference_type::ExternalReferenceTypeEnum>(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(LearningNotesTableIdentifier::Table)
                    .drop_column(LearningNotesTableIdentifier::ExternalType)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(LearningNotesTableIdentifier::Table)
                    .add_column(
                        ColumnDef::new(LearningNotesTableIdentifier::ExternalType)
                            .custom("external_reference_type")
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
                    .table(LearningNotesTableIdentifier::Table)
                    .drop_column(LearningNotesTableIdentifier::ExternalType)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(LearningNotesTableIdentifier::Table)
                    .add_column(
                        ColumnDef::new(LearningNotesTableIdentifier::ExternalType)
                            .text()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .drop_type(
                sea_orm::sea_query::extension::postgres::Type::drop()
                    .name("external_reference_type")
                    .to_owned(),
            )
            .await
    }
}

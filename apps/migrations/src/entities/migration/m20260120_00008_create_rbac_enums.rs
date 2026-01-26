use ::backend::entries::entitiy_enums::{
    action_types::ActionTypeEnum, permission_types::PermissionTypeEnum,
    resource_types::ResourceTypeEnum,
};
use sea_orm::{DbBackend, Schema, sea_query::extension::postgres::Type};
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let schema = Schema::new(DbBackend::Postgres);

        // Create permission_type enum
        manager
            .create_type(schema.create_enum_from_active_enum::<PermissionTypeEnum>())
            .await?;

        // Create resource_type enum
        manager
            .create_type(schema.create_enum_from_active_enum::<ResourceTypeEnum>())
            .await?;

        // Create action_type enum
        manager
            .create_type(schema.create_enum_from_active_enum::<ActionTypeEnum>())
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop enums in reverse order of creation
        manager
            .drop_type(Type::drop().name("action_type").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("resource_type").to_owned())
            .await?;

        manager
            .drop_type(Type::drop().name("permission_type").to_owned())
            .await?;

        Ok(())
    }
}

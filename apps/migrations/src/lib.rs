use sea_orm_migration::{MigrationTrait, MigratorTrait, async_trait};

use crate::entities::migration::{
    m20260120_00000_create_enums, m20260120_00001_create_auth_tables,
};

pub mod entities;
pub mod identifiers;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20260120_00000_create_enums::Migration),
            Box::new(m20260120_00001_create_auth_tables::Migration),
        ]
    }
}

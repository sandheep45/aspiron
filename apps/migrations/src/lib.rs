use sea_orm_migration::{MigrationTrait, MigratorTrait, async_trait};

use crate::entities::migration::{
    m20260120_00000_create_enums, m20260120_00001_create_auth_tables,
    m20260120_00002_create_content_tables, m20260120_00003_create_learning_tables,
    m20260120_00004_create_assessment_tables, m20260120_00005_create_community_tables,
    m20260120_00006_create_live_tables, m20260120_00007_create_notification_tables,
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
            Box::new(m20260120_00002_create_content_tables::Migration),
            Box::new(m20260120_00003_create_learning_tables::Migration),
            Box::new(m20260120_00004_create_assessment_tables::Migration),
            Box::new(m20260120_00005_create_community_tables::Migration),
            Box::new(m20260120_00006_create_live_tables::Migration),
            Box::new(m20260120_00007_create_notification_tables::Migration),
        ]
    }
}

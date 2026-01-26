use sea_orm_migration::{MigrationTrait, MigratorTrait, async_trait};

use crate::entities::migration::{
    m20260120_00000_create_enums, m20260120_00001_create_user_tables,
    m20260120_00002_create_content_tables, m20260120_00003_create_learning_tables,
    m20260120_00004_create_assessment_tables, m20260120_00005_create_community_tables,
    m20260120_00006_create_live_tables, m20260120_00007_create_notification_tables,
    m20260120_00008_create_rbac_enums, m20260120_00009_create_roles_table,
    m20260120_00010_create_permissions_table, m20260120_00011_create_role_permissions_table,
    m20260120_00012_create_user_roles_table, m20260120_00013_create_audit_logs_table,
    m20260120_00014_create_resource_permissions_table, m20260120_00015_create_user_sessions_table,
    m20260120_00016_create_user_profiles_table,
};

pub mod entities;
pub mod identifiers;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20260120_00000_create_enums::Migration),
            Box::new(m20260120_00001_create_user_tables::Migration),
            Box::new(m20260120_00002_create_content_tables::Migration),
            Box::new(m20260120_00003_create_learning_tables::Migration),
            Box::new(m20260120_00004_create_assessment_tables::Migration),
            Box::new(m20260120_00005_create_community_tables::Migration),
            Box::new(m20260120_00006_create_live_tables::Migration),
            Box::new(m20260120_00007_create_notification_tables::Migration),
            Box::new(m20260120_00008_create_rbac_enums::Migration),
            Box::new(m20260120_00009_create_roles_table::Migration),
            Box::new(m20260120_00010_create_permissions_table::Migration),
            Box::new(m20260120_00011_create_role_permissions_table::Migration),
            Box::new(m20260120_00012_create_user_roles_table::Migration),
            Box::new(m20260120_00013_create_audit_logs_table::Migration),
            Box::new(m20260120_00014_create_resource_permissions_table::Migration),
            Box::new(m20260120_00015_create_user_sessions_table::Migration),
            Box::new(m20260120_00016_create_user_profiles_table::Migration),
        ]
    }
}

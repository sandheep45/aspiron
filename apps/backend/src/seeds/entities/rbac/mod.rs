use anyhow::Result;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseTransaction, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::entries::entities::{permission, role, role_permission};
use crate::entries::entity_enums::{
    action_types::ActionTypeEnum, resource_types::ResourceTypeEnum, user_types::UserTypeEnums,
};
use crate::seeds::runner::SeedRunner;

pub mod audit_logs;
pub mod resource_permissions;
pub mod user_sessions;

impl<'a> SeedRunner<'a> {
    pub async fn seed_rbac(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🔐 Seeding RBAC system...");
        }

        let role_ids = self.seed_default_roles(txn).await?;
        let permission_ids = self.seed_default_permissions(txn).await?;
        self.seed_role_permissions(txn, &role_ids, &permission_ids)
            .await?;

        self.relationship_map
            .role_ids
            .insert(UserTypeEnums::STUDENT, role_ids[&UserTypeEnums::STUDENT]);
        self.relationship_map
            .role_ids
            .insert(UserTypeEnums::TEACHER, role_ids[&UserTypeEnums::TEACHER]);
        self.relationship_map
            .role_ids
            .insert(UserTypeEnums::ADMIN, role_ids[&UserTypeEnums::ADMIN]);

        if self.config.show_progress {
            println!("✅ Seeded RBAC system with roles and permissions");
        }

        Ok(())
    }

    async fn seed_default_roles(
        &mut self,
        txn: &DatabaseTransaction,
    ) -> Result<std::collections::HashMap<UserTypeEnums, Uuid>> {
        let mut role_ids = std::collections::HashMap::new();

        let roles = vec![
            (
                UserTypeEnums::STUDENT,
                "Student",
                "Can access learning content and take assessments",
            ),
            (
                UserTypeEnums::TEACHER,
                "Teacher",
                "Can create content and manage assessments",
            ),
            (UserTypeEnums::ADMIN, "Administrator", "Full system access"),
        ];

        for (user_type, display_name, description) in roles {
            let existing_role = role::Entity::find()
                .filter(role::Column::Name.eq(user_type))
                .one(txn)
                .await?;

            let role_id = if let Some(existing) = existing_role {
                existing.id
            } else {
                let role_id = Uuid::new_v4();
                let role_model = role::ActiveModel {
                    id: Set(role_id),
                    name: Set(user_type),
                    display_name: Set(display_name.to_string()),
                    description: Set(Some(description.to_string())),
                    is_system_role: Set(true),
                    created_at: Set(chrono::Utc::now().into()),
                    updated_at: Set(chrono::Utc::now().into()),
                };
                let inserted = role_model.insert(txn).await?;
                inserted.id
            };

            role_ids.insert(user_type, role_id);
        }

        Ok(role_ids)
    }

    async fn seed_default_permissions(
        &mut self,
        txn: &DatabaseTransaction,
    ) -> Result<std::collections::HashMap<String, Uuid>> {
        let mut permission_ids = std::collections::HashMap::new();

        let permissions = vec![
            // Student permissions
            (
                "CONTENT.CREATE",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::CREATE,
                "Create personal learning notes",
            ),
            (
                "CONTENT.READ",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::READ,
                "View learning content",
            ),
            (
                "ASSESSMENT.TAKE",
                ResourceTypeEnum::ASSESSMENT,
                ActionTypeEnum::TAKE,
                "Take assessments",
            ),
            (
                "USER.READ.OWN",
                ResourceTypeEnum::USER,
                ActionTypeEnum::READ,
                "View own profile information",
            ),
            (
                "COMMUNITY.READ",
                ResourceTypeEnum::COMMUNITY,
                ActionTypeEnum::READ,
                "Read community posts and threads",
            ),
            (
                "COMMUNITY.POST.OWN",
                ResourceTypeEnum::COMMUNITY,
                ActionTypeEnum::CREATE,
                "Create community posts and threads",
            ),
            // Teacher permissions (additional)
            (
                "CONTENT.UPDATE.OWN",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::UPDATE,
                "Update own content",
            ),
            (
                "CONTENT.PUBLISH",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::PUBLISH,
                "Publish content to platform",
            ),
            (
                "CONTENT.DELETE.OWN",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::DELETE,
                "Delete own content",
            ),
            (
                "CONTENT.MODERATE",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::MODERATE,
                "Moderate community content",
            ),
            (
                "ASSESSMENT.CREATE",
                ResourceTypeEnum::ASSESSMENT,
                ActionTypeEnum::CREATE,
                "Create assessments",
            ),
            (
                "ASSESSMENT.GRADE",
                ResourceTypeEnum::ASSESSMENT,
                ActionTypeEnum::GRADE,
                "Grade assessments",
            ),
            (
                "ASSESSMENT.VIEW_RESULTS",
                ResourceTypeEnum::ASSESSMENT,
                ActionTypeEnum::VIEW_RESULTS,
                "View assessment results",
            ),
            (
                "ASSESSMENT.VIEW_ANY_RESULTS",
                ResourceTypeEnum::ASSESSMENT,
                ActionTypeEnum::VIEW_ANY_RESULTS,
                "View any user assessment results",
            ),
            (
                "USER.CREATE",
                ResourceTypeEnum::USER,
                ActionTypeEnum::CREATE,
                "Create new users",
            ),
            (
                "USER.READ",
                ResourceTypeEnum::USER,
                ActionTypeEnum::READ,
                "View user information",
            ),
            (
                "USER.UPDATE",
                ResourceTypeEnum::USER,
                ActionTypeEnum::UPDATE,
                "Update user information",
            ),
            (
                "COMMUNITY.UPDATE.OWN",
                ResourceTypeEnum::COMMUNITY,
                ActionTypeEnum::UPDATE,
                "Update own community content",
            ),
            (
                "COMMUNITY.DELETE.OWN",
                ResourceTypeEnum::COMMUNITY,
                ActionTypeEnum::DELETE,
                "Delete own community content",
            ),
            (
                "COMMUNITY.READ.ALL",
                ResourceTypeEnum::COMMUNITY,
                ActionTypeEnum::READ,
                "Read all community content",
            ),
            // Admin permissions (additional)
            (
                "CONTENT.UPDATE.ANY",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::UPDATE,
                "Update any content",
            ),
            (
                "CONTENT.DELETE.ANY",
                ResourceTypeEnum::CONTENT,
                ActionTypeEnum::DELETE,
                "Delete any content",
            ),
            (
                "USER.DELETE",
                ResourceTypeEnum::USER,
                ActionTypeEnum::DELETE,
                "Delete users",
            ),
            (
                "USER.ASSIGN_ROLES",
                ResourceTypeEnum::USER,
                ActionTypeEnum::ASSIGN_ROLES,
                "Assign roles to users",
            ),
            (
                "USER.VIEW_ANALYTICS",
                ResourceTypeEnum::USER,
                ActionTypeEnum::VIEW_ANALYTICS,
                "View user analytics",
            ),
            (
                "SYSTEM.ADMIN",
                ResourceTypeEnum::SYSTEM,
                ActionTypeEnum::MANAGE,
                "Full system administration",
            ),
            (
                "SYSTEM.AUDIT",
                ResourceTypeEnum::SYSTEM,
                ActionTypeEnum::AUDIT,
                "Access system audit logs",
            ),
            (
                "SYSTEM.VIEW_ANALYTICS",
                ResourceTypeEnum::SYSTEM,
                ActionTypeEnum::VIEW_ANALYTICS,
                "View system analytics",
            ),
            (
                "SYSTEM.MANAGE_SETTINGS",
                ResourceTypeEnum::SYSTEM,
                ActionTypeEnum::MANAGE_SETTINGS,
                "Manage system settings",
            ),
        ];

        for (name, resource_type, action, description) in permissions {
            let resource_type_lookup = resource_type.clone();
            let action_lookup = action.clone();

            let existing_permission = permission::Entity::find()
                .filter(permission::Column::ResourceType.eq(resource_type_lookup))
                .filter(permission::Column::Action.eq(action_lookup))
                .one(txn)
                .await?;

            let permission_id = if let Some(existing) = &existing_permission {
                let existing_id = existing.id;

                let mut model: permission::ActiveModel = (*existing).clone().into();
                model.name = Set(name.to_string());
                model.description = Set(Some(description.to_string()));
                model.updated_at = Set(chrono::Utc::now().into());

                model.update(txn).await?;
                existing_id
            } else {
                let permission_id = Uuid::new_v4();
                let permission_model = permission::ActiveModel {
                    id: Set(permission_id),
                    name: Set(name.to_string()),
                    resource_type: Set(resource_type),
                    action: Set(action),
                    description: Set(Some(description.to_string())),
                    created_at: Set(chrono::Utc::now().into()),
                    updated_at: Set(chrono::Utc::now().into()),
                };
                let inserted = permission_model.insert(txn).await?;
                inserted.id
            };

            permission_ids.insert(name.to_string(), permission_id);
        }

        Ok(permission_ids)
    }

    async fn seed_role_permissions(
        &mut self,
        txn: &DatabaseTransaction,
        role_ids: &std::collections::HashMap<UserTypeEnums, Uuid>,
        permission_ids: &std::collections::HashMap<String, Uuid>,
    ) -> Result<()> {
        let student_permissions = vec![
            "CONTENT.CREATE",
            "CONTENT.READ",
            "ASSESSMENT.TAKE",
            "USER.READ.OWN",
            "COMMUNITY.READ",
            "COMMUNITY.POST.OWN",
        ];

        let teacher_permissions = vec![
            "CONTENT.CREATE",
            "CONTENT.READ",
            "ASSESSMENT.TAKE",
            "USER.READ.OWN",
            "COMMUNITY.READ",
            "COMMUNITY.POST.OWN",
            "CONTENT.UPDATE.OWN",
            "CONTENT.PUBLISH",
            "CONTENT.DELETE.OWN",
            "CONTENT.MODERATE",
            "ASSESSMENT.CREATE",
            "ASSESSMENT.GRADE",
            "ASSESSMENT.VIEW_RESULTS",
            "ASSESSMENT.VIEW_ANY_RESULTS",
            "USER.CREATE",
            "USER.READ",
            "USER.UPDATE",
            "COMMUNITY.UPDATE.OWN",
            "COMMUNITY.DELETE.OWN",
            "COMMUNITY.READ.ALL",
        ];

        let admin_permissions: Vec<&str> = permission_ids.keys().map(|s| s.as_str()).collect();

        let role_assignments = [
            (UserTypeEnums::STUDENT, student_permissions),
            (UserTypeEnums::TEACHER, teacher_permissions),
            (UserTypeEnums::ADMIN, admin_permissions),
        ];

        for (user_type, permission_names) in role_assignments.iter() {
            let role_id = role_ids[user_type];

            for permission_name in permission_names.iter() {
                if let Some(&permission_id) = permission_ids.get(*permission_name) {
                    let existing_rp = role_permission::Entity::find()
                        .filter(role_permission::Column::RoleId.eq(role_id))
                        .filter(role_permission::Column::PermissionId.eq(permission_id))
                        .one(txn)
                        .await?;

                    if existing_rp.is_none() {
                        let rp_model = role_permission::ActiveModel {
                            id: Set(Uuid::new_v4()),
                            role_id: Set(role_id),
                            permission_id: Set(permission_id),
                            created_at: Set(chrono::Utc::now().into()),
                        };
                        rp_model.insert(txn).await?;
                    }
                }
            }
        }

        Ok(())
    }
}

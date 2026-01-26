use anyhow::Result;
use bcrypt::{DEFAULT_COST, hash};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseTransaction, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::entries::entities::{user, user_role};
use crate::entries::entitiy_enums::user_types::UserTypeEnums;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_users(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("👥 Seeding users...");
        }

        // 3 Admin users
        let mut admin_ids = Vec::new();
        for i in 1..=3 {
            let user_id = Uuid::new_v4();
            let email = format!("admin{}@aspiron.dev", i);
            let password_hash = hash("admin123", DEFAULT_COST)?;

            let user_model = user::ActiveModel {
                id: Set(user_id),
                email: Set(email),
                password_hash: Set(password_hash),
                is_active: Set(true),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            };

            user_model.insert(txn).await?;
            admin_ids.push(user_id);
        }

        // 10 Teacher users
        let mut teacher_ids = Vec::new();
        for i in 1..=10 {
            let user_id = Uuid::new_v4();
            let email = format!("teacher{}@aspiron.dev", i);
            let password_hash = hash("teacher123", DEFAULT_COST)?;

            let user_model = user::ActiveModel {
                id: Set(user_id),
                email: Set(email),
                password_hash: Set(password_hash),
                is_active: Set(true),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            };

            user_model.insert(txn).await?;
            teacher_ids.push(user_id);
        }

        // 30 Student users
        let mut student_ids = Vec::new();
        for i in 1..=30 {
            let user_id = Uuid::new_v4();
            let email = format!("student{}@aspiron.dev", i);
            let password_hash = hash("student123", DEFAULT_COST)?;

            let user_model = user::ActiveModel {
                id: Set(user_id),
                email: Set(email),
                password_hash: Set(password_hash),
                is_active: Set(true),
                created_at: Set(chrono::Utc::now().into()),
                updated_at: Set(chrono::Utc::now().into()),
            };

            user_model.insert(txn).await?;
            student_ids.push(user_id);
        }

        // Assign roles to users
        self.assign_roles_to_users(txn, &admin_ids, UserTypeEnums::ADMIN)
            .await?;
        self.assign_roles_to_users(txn, &teacher_ids, UserTypeEnums::TEACHER)
            .await?;
        self.assign_roles_to_users(txn, &student_ids, UserTypeEnums::STUDENT)
            .await?;

        // Store in relationship map
        self.relationship_map
            .user_ids
            .insert(UserTypeEnums::ADMIN, admin_ids);
        self.relationship_map
            .user_ids
            .insert(UserTypeEnums::TEACHER, teacher_ids);
        self.relationship_map
            .user_ids
            .insert(UserTypeEnums::STUDENT, student_ids);

        if self.config.show_progress {
            println!(
                "✅ Seeded 43 users (3 admins, 10 teachers, 30 students) with role assignments"
            );
        }

        Ok(())
    }

    async fn assign_roles_to_users(
        &mut self,
        txn: &DatabaseTransaction,
        user_ids: &[Uuid],
        user_type: UserTypeEnums,
    ) -> Result<()> {
        // Get the role ID for this user type
        let role_id = *self
            .relationship_map
            .role_ids
            .get(&user_type)
            .ok_or_else(|| anyhow::anyhow!("Role ID not found for user type: {:?}", user_type))?;

        for &user_id in user_ids {
            // Check if user role already exists
            let existing_user_role = user_role::Entity::find()
                .filter(user_role::Column::UserId.eq(user_id))
                .filter(user_role::Column::RoleId.eq(role_id))
                .one(txn)
                .await?;

            if existing_user_role.is_none() {
                let user_role_model = user_role::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    user_id: Set(user_id),
                    role_id: Set(role_id),
                    assigned_by: Set(None), // System assignment
                    assigned_at: Set(chrono::Utc::now().into()),
                    expires_at: Set(None), // No expiration
                    is_active: Set(true),
                };

                user_role_model.insert(txn).await?;
            }
        }

        Ok(())
    }
}

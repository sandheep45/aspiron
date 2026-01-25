use anyhow::Result;
use bcrypt::{DEFAULT_COST, hash};
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::user;
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
                role: Set(UserTypeEnums::ADMIN),
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
                role: Set(UserTypeEnums::TEACHER),
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
                role: Set(UserTypeEnums::STUDENT),
            };

            user_model.insert(txn).await?;
            student_ids.push(user_id);
        }

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
            println!("✅ Seeded 43 users (3 admins, 10 teachers, 30 students)");
        }

        Ok(())
    }
}

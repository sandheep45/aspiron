use anyhow::Result;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseTransaction, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::entries::entities::{user, user_profile, user_role};
use crate::entries::entity_enums::user_types::UserTypeEnums;
use crate::seeds::runner::SeedRunner;
use crate::seeds::utils::fake_password_generator;
use crate::seeds::utils::fake_password_generator::{
    FakePasswordGenerator, PasswordGenerationStrategy, PatternSuffix,
};
use crate::seeds::utils::passwords::hash_password;

impl<'a> SeedRunner<'a> {
    pub async fn seed_users(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("👥 Seeding users with fake data...");
        }

        // Determine password generation strategy
        let password_strategy = self.determine_password_strategy();

        let mut fake_gen = FakePasswordGenerator::new(12345, password_strategy);
        let password_file = fake_gen.create_password_file();

        // Save passwords to file
        let file_path = "apps/backend/src/seeds/generated_passwords.json";
        fake_gen.save_passwords(file_path, &password_file).await?;

        // Insert admins into database
        let mut admin_ids = Vec::new();
        for fake_user in password_file.users.admins {
            self.insert_user(txn, &fake_user, UserTypeEnums::ADMIN)
                .await?;
            admin_ids.push(fake_user.id);
        }

        // Insert teachers into database
        let mut teacher_ids = Vec::new();
        for fake_user in password_file.users.teachers {
            self.insert_user(txn, &fake_user, UserTypeEnums::TEACHER)
                .await?;
            teacher_ids.push(fake_user.id);
        }

        // Insert students into database
        let mut student_ids = Vec::new();
        for fake_user in password_file.users.students {
            self.insert_user(txn, &fake_user, UserTypeEnums::STUDENT)
                .await?;
            student_ids.push(fake_user.id);
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
                "🔐 Generated {} users with fake credentials",
                password_file.metadata.total_users
            );
            println!("💾 Passwords saved to {}", file_path);
        }

        Ok(())
    }

    fn determine_password_strategy(&self) -> PasswordGenerationStrategy {
        match std::env::var("SEED_PASSWORD_STRATEGY") {
            Ok(strategy) => match strategy.as_str() {
                "random" => PasswordGenerationStrategy::Random {
                    length_range: 8..16,
                },
                "pattern" => PasswordGenerationStrategy::Pattern {
                    prefix: "Aspiron".to_string(),
                    suffix_type: PatternSuffix::Year,
                },
                "memorable" => PasswordGenerationStrategy::Memorable { word_count: 2..4 },
                "custom" => {
                    let admin_pass =
                        std::env::var("ADMIN_PASSWORD").unwrap_or_else(|_| "admin123".to_string());
                    let teacher_pass = std::env::var("TEACHER_PASSWORD")
                        .unwrap_or_else(|_| "teacher123".to_string());
                    let student_pass = std::env::var("STUDENT_PASSWORD")
                        .unwrap_or_else(|_| "student123".to_string());
                    PasswordGenerationStrategy::Fixed {
                        admin_password: admin_pass,
                        teacher_password: teacher_pass,
                        student_password: student_pass,
                    }
                }
                _ => PasswordGenerationStrategy::Fixed {
                    admin_password: "admin123".to_string(),
                    teacher_password: "teacher123".to_string(),
                    student_password: "student123".to_string(),
                },
            },
            _ => PasswordGenerationStrategy::Fixed {
                admin_password: "admin123".to_string(),
                teacher_password: "teacher123".to_string(),
                student_password: "student123".to_string(),
            },
        }
    }

    async fn insert_user(
        &mut self,
        txn: &DatabaseTransaction,
        fake_user: &fake_password_generator::FakeUserCredentials,
        _user_type: UserTypeEnums,
    ) -> Result<()> {
        let password_hash = hash_password(&fake_user.password)?;

        let user_model = user::ActiveModel {
            id: Set(fake_user.id),
            email: Set(fake_user.email.clone()),
            password_hash: Set(password_hash),
            is_active: Set(true),
            created_at: Set(chrono::Utc::now().into()),
            updated_at: Set(chrono::Utc::now().into()),
        };

        user_model.insert(txn).await?;

        // Insert user profile
        let avatar_url = format!(
            "https://api.dicebear.com/7.x/initials/svg?seed={}&backgroundColor=6366f1&textColor=ffffff",
            fake_user.full_name.replace(' ', "+")
        );

        let user_profile_model = user_profile::ActiveModel {
            user_id: Set(fake_user.id),
            first_name: Set(Some(fake_user.first_name.clone())),
            last_name: Set(Some(fake_user.last_name.clone())),
            avatar_url: Set(Some(avatar_url)),
            phone: Set(fake_user.phone.clone()),
            timezone: Set(Some("UTC".to_string())),
            language: Set(Some("en".to_string())),
            preferences: Set(None),
            last_login: Set(None),
            login_count: Set(Some(0)),
            account_locked_until: Set(None),
            failed_login_attempts: Set(Some(0)),
            mfa_enabled: Set(Some(false)),
            mfa_secret_encrypted: Set(None),
        };

        user_profile_model.insert(txn).await?;

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

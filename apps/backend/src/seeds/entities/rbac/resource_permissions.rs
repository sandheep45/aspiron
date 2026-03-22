use anyhow::Result;
use rand::Rng;
use sea_orm::{ActiveModelTrait, DatabaseTransaction, Set};
use uuid::Uuid;

use crate::entries::entities::resource_permission;
use crate::entries::entity_enums::action_types::ActionTypeEnum;
use crate::entries::entity_enums::resource_types::ResourceTypeEnum;
use crate::seeds::runner::SeedRunner;

impl<'a> SeedRunner<'a> {
    pub async fn seed_resource_permissions(&mut self, txn: &DatabaseTransaction) -> Result<()> {
        if self.config.show_progress {
            println!("🔑 Seeding resource permissions...");
        }

        let resource_types = [
            ResourceTypeEnum::CONTENT,
            ResourceTypeEnum::VIDEO,
            ResourceTypeEnum::QUIZ,
            ResourceTypeEnum::SUBJECT,
            ResourceTypeEnum::CHAPTER,
            ResourceTypeEnum::TOPIC,
        ];

        let permissions = [
            ActionTypeEnum::READ,
            ActionTypeEnum::CREATE,
            ActionTypeEnum::UPDATE,
            ActionTypeEnum::DELETE,
            ActionTypeEnum::PUBLISH,
        ];

        let student_ids: Vec<Uuid> = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entity_enums::user_types::UserTypeEnums::STUDENT)
            .cloned()
            .unwrap_or_default();

        let teacher_ids: Vec<Uuid> = self
            .relationship_map
            .user_ids
            .get(&crate::entries::entity_enums::user_types::UserTypeEnums::TEACHER)
            .cloned()
            .unwrap_or_default();

        let mut rng = rand::thread_rng();

        for (idx, student_id) in student_ids.iter().enumerate().take(20) {
            let resource_type = &resource_types[idx % resource_types.len()];
            let permission = &permissions[rng.gen_range(0..permissions.len())];

            let resource_ids: Vec<Uuid> = match resource_type {
                ResourceTypeEnum::SUBJECT => self
                    .relationship_map
                    .subject_ids
                    .values()
                    .flatten()
                    .copied()
                    .collect(),
                ResourceTypeEnum::CHAPTER => self
                    .relationship_map
                    .chapter_map
                    .values()
                    .flatten()
                    .copied()
                    .collect(),
                ResourceTypeEnum::TOPIC => self
                    .relationship_map
                    .topic_map
                    .values()
                    .flatten()
                    .copied()
                    .collect(),
                ResourceTypeEnum::VIDEO => {
                    let mut ids = Vec::new();
                    for videos in self.relationship_map.video_map.values() {
                        ids.extend(videos.iter().copied());
                    }
                    ids
                }
                ResourceTypeEnum::QUIZ => {
                    let mut ids = Vec::new();
                    for quizzes in self.relationship_map.quiz_map.values() {
                        ids.extend(quizzes.iter().copied());
                    }
                    ids
                }
                _ => continue,
            };

            if let Some(resource_id) = resource_ids.get(idx % resource_ids.len()) {
                let granted_by: Option<Uuid> =
                    teacher_ids.get(idx % teacher_ids.len().max(1)).copied();

                let perm_model = resource_permission::ActiveModel {
                    id: Set(Uuid::new_v4()),
                    resource_type: Set(resource_type.clone()),
                    resource_id: Set(*resource_id),
                    user_id: Set(*student_id),
                    permission: Set(permission.clone()),
                    granted_by: Set(granted_by),
                    granted_at: Set(chrono::Utc::now().into()),
                    expires_at: Set(None),
                    conditions: Set(None),
                };

                perm_model.insert(txn).await?;
            }
        }

        if self.config.show_progress {
            println!("✅ Seeded resource permissions");
        }

        Ok(())
    }
}

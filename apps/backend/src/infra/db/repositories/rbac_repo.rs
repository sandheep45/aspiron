use std::sync::Arc;

use async_trait::async_trait;
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

use crate::application::rbac::ports::RbacRepository;
use crate::domain::rbac::entities::{Permission, Role, RolePermission, UserRole};
use crate::entries::entities::{permission, role, role_permission, user_role};
use crate::setup::error::AppError;

pub(crate) struct SeaOrmRbacRepository {
    db: Arc<DatabaseConnection>,
}

impl SeaOrmRbacRepository {
    pub(crate) fn new(db: Arc<DatabaseConnection>) -> Self {
        Self { db }
    }
}

#[async_trait]
impl RbacRepository for SeaOrmRbacRepository {
    async fn get_all_roles(&self) -> Result<Vec<Role>, AppError> {
        let roles = role::Entity::find()
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;
        Ok(roles.into_iter().map(map_role_orm_to_domain).collect())
    }

    async fn get_role_by_id(&self, role_id: Uuid) -> Result<Role, AppError> {
        let orm = role::Entity::find_by_id(role_id)
            .one(&*self.db)
            .await
            .map_err(AppError::Database)?
            .ok_or_else(|| AppError::not_found("Role not found"))?;
        Ok(map_role_orm_to_domain(orm))
    }

    async fn create_role(
        &self,
        _name: String,
        display_name: String,
        description: Option<String>,
    ) -> Result<Role, AppError> {
        let now: sea_orm::prelude::DateTimeWithTimeZone = chrono::Utc::now().into();
        let active = role::ActiveModel {
            id: Set(Uuid::new_v4()),
            name: Set(crate::entries::entity_enums::user_types::UserTypeEnums::STUDENT),
            display_name: Set(display_name),
            description: Set(description),
            is_system_role: Set(false),
            created_at: Set(now),
            updated_at: Set(now),
        };
        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_role_active_to_domain(result))
    }

    async fn assign_permission_to_role(
        &self,
        role_id: Uuid,
        permission_id: Uuid,
    ) -> Result<RolePermission, AppError> {
        let active = role_permission::ActiveModel {
            id: Set(Uuid::new_v4()),
            role_id: Set(role_id),
            permission_id: Set(permission_id),
            created_at: Set(chrono::Utc::now().into()),
        };
        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_role_permission_active_to_domain(result))
    }

    async fn get_user_roles(&self, user_id: Uuid) -> Result<Vec<UserRole>, AppError> {
        let user_roles = user_role::Entity::find()
            .filter(user_role::Column::UserId.eq(user_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;
        Ok(user_roles
            .into_iter()
            .map(map_user_role_orm_to_domain)
            .collect())
    }

    async fn assign_role_to_user(
        &self,
        user_id: Uuid,
        role_id: Uuid,
        assigned_by: Option<Uuid>,
    ) -> Result<UserRole, AppError> {
        let active = user_role::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            role_id: Set(role_id),
            assigned_by: Set(assigned_by),
            assigned_at: Set(chrono::Utc::now().into()),
            expires_at: Set(None),
            is_active: Set(true),
        };
        let result = active.save(&*self.db).await.map_err(AppError::Database)?;
        Ok(map_user_role_active_to_domain(result))
    }

    async fn remove_user_role(&self, user_role_id: Uuid) -> Result<(), AppError> {
        user_role::Entity::delete_by_id(user_role_id)
            .exec(&*self.db)
            .await
            .map_err(AppError::Database)?;
        Ok(())
    }

    async fn get_permissions_for_role(&self, role_id: Uuid) -> Result<Vec<Permission>, AppError> {
        let rps = role_permission::Entity::find()
            .filter(role_permission::Column::RoleId.eq(role_id))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        let perm_ids: Vec<Uuid> = rps.iter().map(|rp| rp.permission_id).collect();
        let perms = permission::Entity::find()
            .filter(permission::Column::Id.is_in(perm_ids))
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;

        Ok(perms
            .into_iter()
            .map(map_permission_orm_to_domain)
            .collect())
    }

    async fn get_all_permissions(&self) -> Result<Vec<Permission>, AppError> {
        let perms = permission::Entity::find()
            .all(&*self.db)
            .await
            .map_err(AppError::Database)?;
        Ok(perms
            .into_iter()
            .map(map_permission_orm_to_domain)
            .collect())
    }
}

fn map_role_orm_to_domain(r: role::Model) -> Role {
    Role {
        id: r.id,
        name: format!("{:?}", r.name).to_lowercase(),
        display_name: r.display_name,
        description: r.description,
        is_system_role: r.is_system_role,
        created_at: r.created_at.into(),
        updated_at: r.updated_at.into(),
    }
}

fn map_role_active_to_domain(r: role::ActiveModel) -> Role {
    Role {
        id: r.id.clone().unwrap(),
        name: format!("{:?}", r.name.clone().unwrap()).to_lowercase(),
        display_name: r.display_name.clone().unwrap(),
        description: r.description.clone().unwrap(),
        is_system_role: r.is_system_role.clone().unwrap(),
        created_at: r.created_at.clone().unwrap().into(),
        updated_at: r.updated_at.clone().unwrap().into(),
    }
}

fn map_permission_orm_to_domain(p: permission::Model) -> Permission {
    Permission {
        id: p.id,
        name: p.name,
        resource_type: format!("{:?}", p.resource_type).to_lowercase(),
        action: format!("{:?}", p.action).to_lowercase(),
        description: p.description,
    }
}

fn map_user_role_orm_to_domain(ur: user_role::Model) -> UserRole {
    UserRole {
        id: ur.id,
        user_id: ur.user_id,
        role_id: ur.role_id,
        is_active: ur.is_active,
        assigned_at: ur.assigned_at.into(),
        expires_at: ur.expires_at.map(Into::into),
    }
}

fn map_user_role_active_to_domain(ur: user_role::ActiveModel) -> UserRole {
    UserRole {
        id: ur.id.clone().unwrap(),
        user_id: ur.user_id.clone().unwrap(),
        role_id: ur.role_id.clone().unwrap(),
        is_active: ur.is_active.clone().unwrap(),
        assigned_at: ur.assigned_at.clone().unwrap().into(),
        expires_at: ur.expires_at.clone().unwrap().map(Into::into),
    }
}

fn map_role_permission_active_to_domain(rp: role_permission::ActiveModel) -> RolePermission {
    RolePermission {
        id: rp.id.clone().unwrap(),
        role_id: rp.role_id.clone().unwrap(),
        permission_id: rp.permission_id.clone().unwrap(),
    }
}

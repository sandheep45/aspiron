#![allow(async_fn_in_trait)]

use crate::setup::error::AppError;
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use uuid::Uuid;

pub trait BaseRepository {
    type Entity;
    type Model;

    fn new(db: Arc<DatabaseConnection>) -> Self;

    async fn find_by_id(&self, id: Uuid) -> Result<Option<Self::Model>, AppError>;

    async fn find_all(&self) -> Result<Vec<Self::Model>, AppError>;

    async fn create(&self, data: Self::Entity) -> Result<Self::Model, AppError>;

    async fn update(&self, id: Uuid, data: Self::Entity) -> Result<Self::Model, AppError>;

    async fn delete(&self, id: Uuid) -> Result<(), AppError>;
}

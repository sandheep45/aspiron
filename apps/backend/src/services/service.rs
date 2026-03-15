use sea_orm::DatabaseConnection;
use std::sync::Arc;

pub trait BaseService {
    type Repository;

    fn new(db: Arc<DatabaseConnection>) -> Self;

    fn repository(&self) -> &Self::Repository;
}

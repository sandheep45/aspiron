use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum UserTableIdentifiers {
    #[iden = "users"]
    Table,
    Id,
    Email,
    PasswordHash,
    IsActive,
    CreatedAt,
    UpdatedAt,
}

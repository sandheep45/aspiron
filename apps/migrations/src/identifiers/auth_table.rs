use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum UserTableIdentifiers {
    #[iden = "user"]
    Table,
    Id,
    Email,
    PasswordHash,
    Role,
    IsActive,
    CreatedAt,
    UpdatedAt,
}

use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum AuthTableIdentifiers {
    Table,
    Id,
    Email,
    PasswordHash,
    Role,
    IsActive,
    CreatedAt,
    UpdatedAt,
}

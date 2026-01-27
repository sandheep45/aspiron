use sea_orm_migration::prelude::*;

#[derive(Iden)]
pub enum RoleTableIdentifiers {
    #[iden = "roles"]
    Table,
    Id,
    Name,
    DisplayName,
    Description,
    IsSystemRole,
    CreatedAt,
    UpdatedAt,
}

#[derive(Iden)]
pub enum PermissionTableIdentifiers {
    #[iden = "permissions"]
    Table,
    Id,
    Name,
    ResourceType,
    Action,
    Description,
    CreatedAt,
    UpdatedAt,
}

#[derive(Iden)]
pub enum RolePermissionTableIdentifiers {
    #[iden = "role_permissions"]
    Table,
    Id,
    RoleId,
    PermissionId,
    CreatedAt,
}

#[derive(Iden)]
pub enum UserRoleTableIdentifiers {
    #[iden = "user_roles"]
    Table,
    Id,
    UserId,
    RoleId,
    AssignedBy,
    AssignedAt,
    ExpiresAt,
    IsActive,
}

#[derive(Iden)]
pub enum AuditLogTableIdentifiers {
    #[iden = "audit_logs"]
    Table,
    Id,
    UserId,
    Action,
    ResourceType,
    ResourceId,
    OldValues,
    NewValues,
    IpAddress,
    UserAgent,
    Timestamp,
    Success,
    FailureReason,
    SessionId,
}

#[derive(Iden)]
pub enum ResourcePermissionTableIdentifiers {
    #[iden = "resource_permissions"]
    Table,
    Id,
    ResourceType,
    ResourceId,
    UserId,
    Permission,
    GrantedBy,
    GrantedAt,
    ExpiresAt,
    Conditions,
}

#[derive(Iden)]
pub enum UserSessionTableIdentifiers {
    #[iden = "user_sessions"]
    Table,
    Id,
    UserId,
    SessionTokenHash,
    IpAddress,
    UserAgent,
    CreatedAt,
    LastActivity,
    ExpiresAt,
    IsActive,
}

#[derive(Iden)]
pub enum UserProfileTableIdentifiers {
    #[iden = "user_profiles"]
    Table,
    UserId,
    FirstName,
    LastName,
    AvatarUrl,
    Phone,
    Timezone,
    Language,
    Preferences,
    LastLogin,
    LoginCount,
    AccountLockedUntil,
    FailedLoginAttempts,
    MfaEnabled,
    MfaSecretEncrypted,
}

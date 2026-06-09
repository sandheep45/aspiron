#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AssignmentStatus {
    Active,
    Expired,
    Revoked,
}

impl AssignmentStatus {
    pub fn from_active_and_expiry(
        is_active: bool,
        expires_at: Option<chrono::DateTime<chrono::Utc>>,
    ) -> Self {
        match (is_active, expires_at) {
            (false, _) => AssignmentStatus::Revoked,
            (true, Some(expiry)) if chrono::Utc::now() > expiry => AssignmentStatus::Expired,
            _ => AssignmentStatus::Active,
        }
    }
}

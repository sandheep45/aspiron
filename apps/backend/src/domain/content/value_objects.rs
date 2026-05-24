#[derive(Debug, Clone)]
pub struct OfflineToken {
    pub token: String,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone)]
pub struct PlaybackToken {
    pub token: String,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

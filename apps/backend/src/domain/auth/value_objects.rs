use std::fmt;

pub struct UserId(pub uuid::Uuid);

impl fmt::Display for UserId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<uuid::Uuid> for UserId {
    fn from(id: uuid::Uuid) -> Self {
        Self(id)
    }
}

pub struct Email(pub String);

impl Email {
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

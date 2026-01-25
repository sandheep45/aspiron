use anyhow::Result;
use bcrypt::{DEFAULT_COST, hash};

pub fn hash_password(password: &str) -> Result<String> {
    Ok(hash(password, DEFAULT_COST)?)
}

pub const DEFAULT_ADMIN_PASSWORD: &str = "admin123";
pub const DEFAULT_TEACHER_PASSWORD: &str = "teacher123";
pub const DEFAULT_STUDENT_PASSWORD: &str = "student123";

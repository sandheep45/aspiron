use async_trait::async_trait;

use crate::application::auth::ports::PasswordService;
use crate::setup::error::AppError;

pub(crate) struct BcryptPasswordService;

#[async_trait]
impl PasswordService for BcryptPasswordService {
    fn verify(&self, password: &str, hash: &str) -> Result<bool, AppError> {
        bcrypt::verify(password, hash).map_err(|_| AppError::auth("Password verification failed"))
    }
}

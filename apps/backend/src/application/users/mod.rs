pub mod permission;
pub mod ports;
pub mod service;

use std::sync::Arc;

use self::ports::UserRepository;
use self::service::UserService;

#[derive(Clone)]
pub struct UsersApplicationState {
    pub user_service: UserService,
}

impl UsersApplicationState {
    pub fn new(repo: Arc<dyn UserRepository>) -> Self {
        Self {
            user_service: UserService::new(repo),
        }
    }
}

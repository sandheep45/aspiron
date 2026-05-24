pub mod ports;

use std::sync::Arc;

app_state!(NotificationApplicationState, ports::NotificationRepository);

pub mod ports;

use std::sync::Arc;

app_state!(RbacApplicationState, ports::RbacRepository);
